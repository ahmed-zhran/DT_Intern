import logo from '../logo.svg'
const Header = ({setModalData}) => {
  return (
    <header className="navbar navbar bg-dark rounded m-2">
        <div className="container-fluid d-inline-flex flex-row py-2">
            <img src={logo} alt="logo" className="App-logo navbar-brand"/>
            <button className="btn btn-dark hover bg-info" data-toggle="modal" data-target="#exampleModalCenter" onClick={() => setModalData({type: 'add'})}>Add</button>
        </div>
    </header>
  )
}

export default Header