import { useState, useMemo } from "react";
import Modal from "./Modal";

const PageModal = ({isOpen, title, onClose, PageMap, defaultPage, dragOn}) => {
const [ page, setPage ] = useState(defaultPage);
const [ data, setData ]= useState({})

const handlePage = (step, states) => {
setPage(step);
setData(states);
}

const { component : Component, props } = useMemo(() => PageMap[page], [page]);



return (
    <Modal isOpen ={isOpen} title = {title}  onClose = {onClose} dragOn ={dragOn}>
    <Component { ...props } handlePage={handlePage} data={data} />
    </Modal>
)
}

export default PageModal;