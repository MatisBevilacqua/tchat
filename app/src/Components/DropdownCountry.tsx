import country from "../data/country.json"
import { langData } from '../data/lang/lang';
import { useAppSelector } from '../store/store';
import DropdownComponent from '../utils/DropdownFactory';

const data = country.map((item) => {
  return {
    label: item,
    value: item,
  };
})

interface Props {
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
}

export default function DropdownCountry({ value, setValue, placeholder }: Props) {
  const lang = useAppSelector(state => langData[state.language].dropdown)

  return <DropdownComponent
    value={value}
    setValue={setValue as any}
    data={data}
    isSearch={true}
    search={lang.search}
    placeholder={placeholder || lang.countryPlaceholder}
  />
}
