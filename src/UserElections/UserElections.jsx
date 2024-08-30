import React, { useState, useEffect } from 'react';
import { getElections, addElection } from '../elections';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import './UserElections.css'
import ElectionInList from './ElectionInList';
import ElectionRegistration from './ElectionRegistration';
import PositionRegistration from './PositionRegistration';

const UserElections = () => {
  const [elections, setElections] = useState([]);
  const [isElectionRegistrationModalOpen, setIsElectionRegistrationModalOpen] = useState(false);
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setElections(getElections());
  }, []);

  const handleAddElection = (newElection) => {
    addElection(newElection);
    setElections(getElections());
  };

  const handleElectionContinue = () => {
    setIsElectionRegistrationModalOpen(false);
    setIsPositionModalOpen(true);
  };

  const handleElectionClicked = (title) => {
    navigate('/election', { state: {title}});
  }

  const openElectionRegistrationModal = () => setIsElectionRegistrationModalOpen(true);
  const closeElectionRegistrationModal = () => setIsElectionRegistrationModalOpen(false);
  const closePositionModal = () => setIsPositionModalOpen(false);

  return (
    <div className='my-elections'>
      <h1 className='my-elections-title'>Sus Elecciones</h1>
      <button className='add-election-button' onClick={openElectionRegistrationModal}>Crear Eleccion</button>
      <div style={{padding: '10px'}}>
        <div className="election-data">
          <span className="election-name">Nombre</span>
          <span className="election-date">Fecha de Inicio</span>
          <span className="election-date">Fecha de Fin</span>
        </div>
        <ul className='election-list'>
          {elections.map((election, index) => (
            <li onClick={() => handleElectionClicked(election.name)} key={index}>
              <ElectionInList name={election.name} startDate={election.startDate} endDate={election.endDate}/>
            </li>
          ))}
        </ul>
      </div>

      <Modal show={isElectionRegistrationModalOpen} onHide={closeElectionRegistrationModal}>
        <Modal.Header closeButton>
          <Modal.Title>Registrar Elección</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ElectionRegistration onAddElection={handleAddElection} handleContinue={handleElectionContinue} />
        </Modal.Body>
      </Modal>

      <Modal show={isPositionModalOpen} onHide={closePositionModal}>
        <Modal.Header closeButton>
          <Modal.Title>Registro de Posición</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PositionRegistration onClose={closePositionModal} />
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default UserElections;
