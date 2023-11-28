import styled from "styled-components/native";

export const Container = styled.View<{ $marginTop?: number }>`
  margin-top: ${props => props.$marginTop || 42}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

export const Group = styled.View`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
