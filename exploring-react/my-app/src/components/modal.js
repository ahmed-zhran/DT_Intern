import { useState } from "react";

const Modal = ({ onAdd, onEdit, ModalData}) => {
    const [formData, updateFormData] = useState({});
    const handleChange = (e) => {
        updateFormData({
        ...formData,
        // Trimming any whitespace
        [e.target.name]: e.target.value.trim()
        });
    };
    const handleSubmit = (e) => {
        e.preventDefault()
        //console.log(formData)
        if(ModalData.type === 'edit'){
            onEdit(ModalData.id,JSON.stringify(formData));
        }
        else if(ModalData.type === 'add'){
            onAdd(JSON.stringify(formData));
        }
        document.getElementById("resset").reset();
    };
  return (
    <>
    <div className="modal fade" id="exampleModalCenter" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
                <form onSubmit={handleSubmit} id="resset">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLongTitle">Modal title</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <label>name</label>
                        <input required onChange={handleChange} type="text" name="name" className="form-control" placeholder="Enter name" />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="submit" className="btn btn-primary" >{ModalData.type}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    </>
  )
}

export default Modal