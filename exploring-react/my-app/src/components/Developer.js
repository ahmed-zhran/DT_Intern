import { FaTimes, FaEdit } from 'react-icons/fa';
const Developer = ({ setModalData, onDelete, idd, idx, fields }) => {
  return (
    <tr >
        <th scope="row" className="">{idx}</th>
        {
            Object.keys(fields).map((attrib, index) => {
                return (
                    attrib !== "_id" && <td key={index}>{fields[attrib]} </td>
                )
            })
        }
        <th scope="row"> <FaEdit onClick={() => setModalData({type: 'edit', id:idd})} className="ed-fa" data-toggle="modal" data-target="#exampleModalCenter"/><FaTimes className="ex-fa" onClick={() => onDelete(idd)} /> </th>
    </tr>
  )
}

export default Developer