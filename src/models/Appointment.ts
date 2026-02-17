import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';
import { IAppointment, AppointmentStatus, AppointmentUrgency } from '../types/entities.types.js';

interface AppointmentCreationAttributes extends Optional<IAppointment, 'id' | 'status' | 'notes' | 'createdAt' | 'updatedAt'> {}

class Appointment extends Model<IAppointment, AppointmentCreationAttributes> implements IAppointment {
  declare id: string;
  declare name: string;
  declare email: string;
  declare subject: string;
  declare urgency: AppointmentUrgency;
  declare date: Date;
  declare time: string;
  declare status: AppointmentStatus;
  declare notes?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Appointment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { isEmail: true },
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    urgency: {
      type: DataTypes.ENUM('non-urgent', 'urgent'),
      defaultValue: 'non-urgent',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Appointment',
    tableName: 'appointments',
    indexes: [
      { fields: ['date'] },
      { fields: ['email'] },
    ],
  }
);

export default Appointment;
