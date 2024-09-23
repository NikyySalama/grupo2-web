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
  const [tablesData, setTablesData] = useState([]);
  const [isFileValid, setIsFileValid] = useState(false);

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
        setTables(data);
      } else {
        console.error('error al obtener las mesas', response.statusText);
      }
    } catch (error) {
      console.error('error en la solicitud de partidos', error);
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

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setIsFileValid(false);
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
  

  const handleTablesSubmit = (e) => {
    e.preventDefault();
    handleCloseUploadModal();
    tablesData.forEach(tableData => postTable(tableData));
    fetchTables();
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
        <h2 className='my-section-title'>Sus Mesas</h2>
        <button className='add-section-button' onClick={handleCreateTableClick}>Crear Mesa</button>
      </div>

      <CustomTable columns={columns} rows={rows} onRowClick={(row) => console.log('Fila clickeada', row)} />

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
    </div>
  );
};

export default Tables;