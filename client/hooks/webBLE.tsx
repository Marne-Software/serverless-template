import * as React from "react";
import { SetStateAction, useState, useEffect } from "react";
import { IAppContext, IBLEData } from "../src/Types/AppInterfaces";
import { AppContext } from "../src/Types/Context";

interface IBLEAttr {
  isConnected: boolean;
  id: string;
  room?: string;
}

export interface BLEConnect {
  connectDevice: () => void;
  disconnect: () => void;
  deviceAttr?: IBLEAttr;
  send: (data: any) => Promise<void>;
  setDeviceAttr: (value: IBLEAttr | SetStateAction<IBLEAttr>) => void;
  receivedData: string;
  ledStatus: { status: string; color: string; isBlinking: boolean };
  setLedStatus: (data: BLEConnect["ledStatus"]) => void;
}

export const useWebBLE = (): BLEConnect => {
  const [deviceAttr, setDeviceAttr] = useState<IBLEAttr>({
    id: "",
    isConnected: false,
  });

  const [characteristic, setCharacteristic] =
    useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [activeDevice, setActiveDevice] = useState<BluetoothDevice | null>(
    null
  );
  const [ledStatus, setLedStatus] = useState<BLEConnect["ledStatus"]>({
    status: "",
    color: "",
    isBlinking: false,
  });

  const connectDevice = async () => {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ["adfb5e94-1a1d-46ee-9413-657f5068e69c"] }]
    });
    
    setActiveDevice(device);
    const server = await device.gatt?.connect();

    const service = await server?.getPrimaryService(
      "adfb5e94-1a1d-46ee-9413-657f5068e69c"
    );
    const char = await service?.getCharacteristic(
      "b52d52b6-0702-451f-8a32-0212640902f5"
    );
    const deviceID = await char?.readValue();
    setDeviceAttr({
      id: new TextDecoder("utf-8").decode(deviceID),
      isConnected: true,
    });
    //@ts-ignore. @ts-expect-error
    setCharacteristic(char);
  };

  const disconnect = async () => {
    await activeDevice?.gatt?.disconnect();
    //Resolve clear ids
    setDeviceAttr((prevState: IBLEAttr) => ({
      ...prevState,
      isConnected: false,
    }));
    setActiveDevice(null);
  };

  const send = async (data: string) => {
    var maxChunk = 512;

    if (data.length > maxChunk) {
      for (var i = 0; i < data.length; i += maxChunk) {
        var subStr;
        if (i + maxChunk <= data.length) {
          subStr = data.substring(i, i + maxChunk);
        } else {
          subStr = data.substring(i, data.length);
        }
        await delay(250); // Use an async delay function
        await writeStrToCharacteristic(subStr);
      }
      setLedStatus({ status: "Registering", color: "GREEN", isBlinking: true });
    } else {
      setLedStatus({ status: "Registering", color: "GREEN", isBlinking: true });
      await writeStrToCharacteristic(data);
    }

    async function writeStrToCharacteristic(data: string) {
      return await characteristic?.writeValue(new TextEncoder().encode(data));
    }

    disconnect();
  };

  // Async delay function
  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const [receivedData, setReceivedData] = useState<string>("");
  const [hasCharacteristicSet, setHasCharacteristicSet] = useState(false);

  useEffect(() => {
    const readData = async () => {
      if (characteristic && !hasCharacteristicSet) {
        try {
          const data = await characteristic.readValue();
          const decodedData = new TextDecoder().decode(data);
          setReceivedData(decodedData);
          setHasCharacteristicSet(true); // Set the flag to indicate that characteristic is set
        } catch (error) {
          console.error("Error reading BLE data:", error);
        }
      }
    };

    const intervalId = setInterval(readData, 1000); // Adjust interval as needed

    return () => clearInterval(intervalId); // Cleanup function
  }, [characteristic, hasCharacteristicSet]);

  return {
    connectDevice,
    disconnect,
    send,
    deviceAttr,
    setDeviceAttr,
    receivedData,
    ledStatus,
    setLedStatus,
  };
};
