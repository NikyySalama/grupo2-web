import React, { useState, useEffect } from 'react';
import { useElection } from '../ElectionContext';
import CustomTable from '../../CustomTable';
import { Modal } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import '../ElectionSection.css';

const Tables = () => {
  const electionId = useElection();
  const [tables, setTables] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showUploadTableModal, setShowUploadTableModal] = useState(false);
  const [tablesData, setTablesData] = useState([]);
  const [isFileValid, setIsFileValid] = useState(false);
  const [tableData, setTableData] = useState({
    country: '', 
    state: '',
    city: '',
    address: '',
    uuid: '',
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/elections/${electionId}/tables`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTables(data); // Guardamos las mesas tal como llegan
      } else {
        console.error('Error al obtener las mesas', response.statusText);
      }
    } catch (error) {
      console.error('Error en la solicitud de mesas', error);
    }
  };

  const postTable = async (table) => {
    const location = {
      country: table.country,
      state: table.state,
      city: table.city,
      address: table.address
    };
    const tableToSend = {
      name: table.id,
      location: location
    };
    try {
      const response = await fetch(`http://localhost:8080/api/tables/${electionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tableToSend)
      });
      if (response.ok) {
        const savedTable = await response.json();
        console.log('Mesa guardada:', savedTable);
        fetchTables();
      } else {
        console.error('Error al guardar la mesa:', response.statusText);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleCreateTableClick = () => {
    setShowUploadModal(true);
  };

  const handleTableClick = (row) => {
    // Buscar la mesa correcta usando su dirección o algún identificador único
    const clickedTable = tables.find(table => table.location.address === row.address);
    if (clickedTable) {
      setTableData({
        country: clickedTable.location.country, 
        state: clickedTable.location.state,
        city: clickedTable.location.city,
        address: clickedTable.location.address,
        uuid: clickedTable.uuid,
      });
      setShowUploadTableModal(true); // Mostrar modal para edición
    }
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setIsFileValid(false);
  };

  const handleCloseEditTableModal = () => {
    setShowUploadTableModal(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
  
    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
      const requiredColumns = ['id', 'country', 'state', 'city', 'address'];
      const fileColumns = data[0]; 
  
      const isValid = requiredColumns.every(col => fileColumns.includes(col));
  
      if (!isValid) {
        alert('El archivo Excel no tiene la estructura correcta. Asegúrate de que contenga las columnas: id, country, state, city, address.');
        setIsFileValid(false);
        e.target.value = '';
        return;
      }
      const tablesData = XLSX.utils.sheet_to_json(sheet);
      setTablesData(tablesData);
      setIsFileValid(true);
    };
  
    reader.readAsArrayBuffer(file);
  };

  const handleUpdateTable = async () => {
    const { country, state, city, address, uuid } = tableData;
    const location = {
      country, state, city, address,
    };

    const tableToSend = {
      location,
    };

    try {
        const response = await fetch(`http://localhost:8080/api/tables/${uuid}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tableToSend)
        });

        if (response.ok) {
            const savedTable = await response.json();
            fetchTables(); 
        } else {
            console.error('Error al actualizar la mesa:', response.statusText);
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
    }
    setShowUploadTableModal(false);
  };

  const handleTablesSubmit = (e) => {
    e.preventDefault();
    handleCloseUploadModal();
    tablesData.forEach(tableData => postTable(tableData));
    fetchTables();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTableData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const columns = [
    { label: 'Numero', field: 'id', align: 'left' },
    { label: 'Ciudad', field: 'city', align: 'left' },
    { label: 'Direccion', field: 'address', align: 'left' },
  ];

  const rows = tables.map((table, index) => ({
    id: index + 1,
    city: table.location.city,
    address: table.location.address,
  }));

  return (
    <div className='my-section'>
      <div className="my-section-header">
        {/*<h2 className='my-section-title'>Sus Mesas</h2>
        <button className='add-section-button' onClick={handleCreateTableClick}>Crear Mesa</button>*/}
      </div>

      <CustomTable 
        title="Sus Mesas" 
        columns={columns} 
        rows={rows} 
        onRowClick={handleTableClick} 
        handleAddSelected={handleCreateTableClick}/>

      <Modal show={showUploadModal} onHide={handleCloseUploadModal}>
        <Modal.Header closeButton>
          <Modal.Title>Cargar Datos de Mesas</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleTablesSubmit}>
            <div className="form-group">
              <label>Subir archivo Excel con Mesas:</label>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                required
              />
            </div>
            <button type="submit" className="modal-button" disabled={!isFileValid}>
              Guardar
            </button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Modal para editar mesa seleccionada */}
      <Modal show={showUploadTableModal} onHide={handleCloseEditTableModal}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Mesa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="form-group">
              <label>País:</label>
              <input
                type="text"
                name="country"
                value={tableData.country}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>Estado:</label>
              <input
                type="text"
                name="state"
                value={tableData.state}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>Ciudad:</label>
              <input
                type="text"
                name="city"
                value={tableData.city}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>Dirección:</label>
              <input
                type="text"
                name="address"
                value={tableData.address}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            <button type="button" className="modal-button" onClick={handleUpdateTable}>
              Guardar
            </button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Tables;