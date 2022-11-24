import Developer from "./Developer";
import Popup from 'reactjs-popup';
import {useRef} from 'react';

const Table = ({ setModalData, onDelete, tableStatictics, data }) => {
  const pageLimit = useRef(tableStatictics.param.limit);
  const changeLimit = () => {
    tableStatictics.setParams({limit:parseInt(pageLimit.current.value)})
  }
  return (
    <div className="bg-light rounded px-2 py-2 mx-3 mt-5">
      {
        data ?
        (
        <>
          <table className="table table-striped mb-0 table-hover rounded table-bordered align-middle text-center">
            <thead className="thead-dark">
              <tr>
                  <th scope="col">#</th>
                  {
                      Object.keys(data[0]).map((attrib, index) => {
                          return (
                              attrib !== "_id" && <th key={index} scope="col">{attrib}</th>
                          )
                      })
                  }
                  <th scope="col">Funcs</th>
              </tr>
            </thead>
            <tbody>
              { data.map((developer,index) => <Developer setModalData={setModalData} key={index} idd={developer._id} idx={(index+1) + ((tableStatictics.res.pageNo-1) * tableStatictics.res.limitperpage )} fields={developer} onDelete={onDelete} />) }
            </tbody>
          </table>
          <div aria-label="d-flex ">
            <ul className="d-inline-flex pagination mb-0 mt-1">
              {tableStatictics.param.page > 1 &&<li className="page-item">
                <span className="page-link" onClick={()=> tableStatictics.setParams({page: tableStatictics.param.page - 1})}>Prev</span>
              </li>}
              {tableStatictics.param.page < tableStatictics.res.availablePages &&<li className="page-item">
                <span className="page-link" onClick={()=> tableStatictics.setParams({page: tableStatictics.param.page + 1})}>Next</span>
              </li>}
              <li className="page-item ml-2">
                <Popup trigger={<span className="page-link">limit</span>} closeOnDocumentClick position="right center align-middle" className="d-flex popup">
                  <input defaultValue={tableStatictics.param.limit} ref={pageLimit} type="number" className="popup-el ml-1 d-inline-flex"/>
                  <span onClick={changeLimit} className="popup-el rounded page-link ml-1 d-inline-flex">set</span>
                </Popup>
              </li>
            </ul>
            <div className="d-inline float-right align-middle mt-1">
            { 
              Object.keys(tableStatictics.res).map((atrib, index) => {
                return(
                  tableStatictics.res[atrib] &&
                  <span className="d-inline-flex p-2 text-info" key={index}>{atrib} : {tableStatictics.res[atrib]}</span>
                )
              })
            }
            </div>
          </div>
        </>
        )
        :
        (
        <> 
          <div className="text-danger mx-auto text-center">no tasks available
          { 
            Object.keys(tableStatictics.res).map((atrib, index) => {
              return(
                tableStatictics.res[atrib] != null &&
                <span className="d-inline-flex p-2 text-info" key={index}>{atrib} : {tableStatictics.res[atrib]}</span>
              )
            })
          }
          </div>
        </>
        )
      }
    </div>
  )
}



export default Table