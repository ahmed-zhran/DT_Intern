import './App.css';
import Header from './components/Header';
import Table from './components/Table';
import Modal from './components/modal';
import { useCallback, useEffect, useState } from "react";

function App() {
  const [tasks, setTasks] = useState({});
  const [tableParams, settableParams] = useState({page:1, limit:10})
  const [deleting, setDelete] = useState(false);
  const [editing, setEdit] = useState(false);
  const [adding, setAdd] = useState(false);
  const [ModalData, setModal] = useState({type: 'none'});
  
  //fetching
  const fetchTasks = async (page, limit) => {
    const res = await fetch(`http://127.0.0.1:4000/api/v3/app/events/${page}/${limit}`);
    const data = await res.json();
    return data;
  }

  //deleting item
  const deleteTask = useCallback( async (id) => {
    const res = await fetch(`http://127.0.0.1:4000/api/v3/app/event/${id}`, {method: 'DELETE'}).then((e) => {return e.json()});
    setDelete(!deleting);
    console.log(res.msg);
  },[deleting]);

  //editing item
  const editTask = useCallback( async (id, body) => {
    //console.log(body);
    const res = await fetch(`http://127.0.0.1:4000/api/v3/app/event/${id}`, {method: 'PUT', headers: { 'Content-Type': 'application/json' }, body:body}).then((e) => {return e.json()});
    setEdit(!editing);
    console.log(res.msg);
  },[editing]);

  //adding item
  const addTask = useCallback( async ( body) => {
    //console.log(body);
    const res = await fetch(`http://127.0.0.1:4000/api/v3/app/event`, {method: 'POST', headers: { 'Content-Type': 'application/json' }, body:body}).then((e) => {return e.json()});
    setAdd(!adding);
    console.log(res.msg);
  },[adding]);

  useEffect(() => {
    const getTasks = async () => {
      const tasksFromServer = await fetchTasks(tableParams.page, tableParams.limit);
      setTasks(tasksFromServer);
    }

    getTasks()
  },[tableParams, deleteTask, editTask, addTask]);

  const tableStatictics = {
    res: tasks.res,
    param: tableParams,
    setParams(edit){
      let edited = {...this.param};
      Object.keys(edit).forEach((attrib)=>{
        edited[attrib] = edit[attrib];
      })
      settableParams(edited);
      this.res = tasks.res;
    }
  }
  
  return (
    <div className="App mx-5">
      <Header setModalData={setModal} />
      <Modal ModalData={ModalData} onAdd={addTask} onEdit={editTask}/>
      {tasks.res && <Table setModalData={setModal} tableStatictics={tableStatictics} data={tasks.data} onDelete={deleteTask} onEdit={editTask}/> }
    </div>
  );
}

export default App;
