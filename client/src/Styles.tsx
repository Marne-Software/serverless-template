import styled from "styled-components";

export const FlexRow = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  });

export const FlexCol = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const Overlay = styled('div')`
  position: fixed; 
  width: 100%;
  height: 100%; 
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.4);
  z-index: 99;
  display: inline;
`;

