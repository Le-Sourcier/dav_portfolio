import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';
import { IContact } from '../types/entities.types.js';

interface ContactCreationAttributes extends Optional<IContact, 'id' | 'read' | 'reply' | 'repliedAt' | 'createdAt'> {}

class Contact extends Model<IContact, ContactCreationAttributes> implements IContact {
  declare id: string;
  declare name: string;
  declare email: string;
  declare subject?: string;
  declare message: string;
  declare read: boolean;
  declare reply?: string;
  declare repliedAt?: Date;
  declare readonly createdAt: Date;
}

Contact.init(
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
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reply: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    repliedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Contact',
    tableName: 'contacts',
    updatedAt: false,
  }
);

export default Contact;
