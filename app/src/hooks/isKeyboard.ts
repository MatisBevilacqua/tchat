import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

export const isKeyboard = () => {
  const [isKeyboardShow, setIsKeyboardShow] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", () => {
      setIsKeyboardShow(true);
    });

    const hideSub = Keyboard.addListener("keyboardWillHide", () => {
      setIsKeyboardShow(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  });

  return isKeyboardShow
}
