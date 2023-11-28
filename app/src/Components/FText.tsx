import { useFonts, Montserrat_400Regular } from "@expo-google-fonts/montserrat";
import styled from "styled-components/native"

interface Props extends React.PropsWithChildren {
  font?: [number, string];
}

const CustomText = styled.Text<{ $color?: string, $size?: string }>`
  color: ${props => props.$color || "#14213d"};
  font-size: ${props => props.$size || "16px"};
`

export function FText ({
  children,
  font: fontProps,
  $color,
  $size
}: Props & typeof CustomText.defaultProps) {
  const font: [number, string] = [
    fontProps?.[0] || Montserrat_400Regular,
    fontProps?.[1] || "Montserrat_400Regular"
  ]

  const [fontsLoaded, fontError] = useFonts({
    [font[1]]: font[0]
  })

  if (!fontsLoaded && !fontError) return null

  return <CustomText {...{ $color, $size }} style={{ fontFamily: font[1] }}>
    {children}
  </CustomText>
}
