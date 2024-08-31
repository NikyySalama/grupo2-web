import React, {useState} from "react"

const ListRegistration = ({onAddElection, handleContinue}) => {
    const [formData, setFormData] = useState({
        color: '',
        name: '',
        id: ''
    });

    const handleChange = (e) => {
    const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newElection = {
            id: Date.now(),
            ...formData,
        };
        onAddElection(newElection);
        handleContinue();
    };

    return(
        <div className="election-registration">
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Nombre:</label>
                    <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    />
                </div>
                <div>
                    <label htmlFor="description">Descripción:</label>
                    <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    />
                </div>
                <div>
                    <label htmlFor="startDate">Fecha de Inicio:</label>
                    <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    />
                </div>
                <div>
                    <label htmlFor="endDate">Fecha de Fin:</label>
                    <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Continuar</button>
            </form>
        </div>
    )
}

export default ListRegistration