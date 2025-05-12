const CheckBox = ({ label, checked, onChange }) => {
  return (
    <label className="flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="form-checkbox h-5 w-5 text-[#00893B] border-gray-300 rounded focus:ring-[#00893B]"
      />
      <span className="ml-2 text-gray-700">{label}</span>
    </label>
  );
}

export default CheckBox;