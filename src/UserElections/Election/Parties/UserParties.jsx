import React, { useState, useEffect } from 'react';
import { useElection } from '../ElectionContext';
import { Modal } from 'react-bootstrap';
import CustomTable from '../../CustomTable';
import '../Formula/UserLists.css';

const UserParties = () => {
    const electionId = useElection();
    const [parties, setParties] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        logoUrl: '', 
        colorHex: '',
        name: ''
    });

    const fetchParties = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/elections/${electionId}/parties`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setParties(data);
            } else {
                console.error('Error al obtener los partidos', response.statusText);
            }
        } catch (error) {
            console.error('Error en la solicitud de partidos', error);
        }
    };

    useEffect(() => {
        fetchParties();
    }, []);

    const handleCreatePartyClick = () => {
        setFormData({ logoUrl: '', colorHex: '', name: '' });
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleAddParty = async (newParty) => {
        const partyData = {
            logoUrl: newParty.logoUrl,
            colorHex: newParty.colorHex,
            name: newParty.name,
            electionUuid: electionId
        };

        try {
            const response = await fetch(`http://localhost:8080/api/parties/${electionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(partyData)
            });

            if (response.ok) {
                const savedParty = await response.json();
                fetchParties(); 
            } else {
                console.error('Error al guardar el partido:', response.statusText);
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleAddParty(formData);
        handleClose();
    };

    // Definir las columnas para CustomTable
    const columns = [
        { label: 'Nombre', field: 'name', align: 'left' },
    ];

    // Transformar los partidos para filas de CustomTable
    const rows = parties.map(party => ({
        name: party.name
    }));

    return (
        <div className="user-lists">
            <h1 className="my-tables-title">Sus Partidos</h1>
            <button className="add-list-button" onClick={handleCreatePartyClick}>
                Crear Partido
            </button>
            
            {/* Reemplazar el contenido de lists-content por CustomTable */}
            <CustomTable 
                columns={columns}
                rows={rows}
                onRowClick={(row) => console.log('Partido seleccionado:', row)}
            />

            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Agregar Partido</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="logoUrl">Logo URL:</label>
                            <input
                                type="text"
                                id="logoUrl"
                                name="logoUrl"
                                value={formData.logoUrl}
                                onChange={handleChange}
                                placeholder="Ingrese la URL del logo"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="colorHex">Color:</label>
                            <input
                                type="color"
                                id="colorHex"
                                name="colorHex"
                                value={formData.colorHex}
                                onChange={handleChange}
                                placeholder="Ingrese el color"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="name">Nombre:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ingrese nombre"
                                required
                            />
                        </div>
                        <button type="submit" className="modal-button">
                            Guardar
                        </button>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default UserParties;
