import { useMemo } from 'react';
import { langData } from '../data/lang/lang';
import { useAppSelector } from '../store/store';
import DropdownComponent from '../utils/DropdownFactory';

interface Props {
  value: number;
  setValue: (value: number) => void;
}

export default function DropdownGender({ value, setValue }: Props) {
  const lang = useAppSelector(state => langData[state.language].dropdown)

  const data = useMemo(() => {
    return lang.gender.map((item, i) => {
      return {
        label: item,
        value: i + 1,
      };
    })
  }, [lang])

  return <DropdownComponent
    value={value as any}
    setValue={setValue as any}
    data={data}
    search={lang.search}
    isSearch={false}
    placeholder={lang.genderPlaceholder}
  />
}
