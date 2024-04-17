import './App.css';
import { useState } from 'react';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import DataTable from './components/Datatable';



function App() {
  
  const [data, setData] = useState([]); // Initialize data state with initial data

  return (
    
    <div className="App">
      <h1>All Members</h1>
       <DataTable data={data} setData={setData} />
    </div>
  );
}

export default App;
