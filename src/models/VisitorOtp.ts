import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

interface VisitorOtpAttributes {
  id: string;
  email: string;
  code: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

interface VisitorOtpCreation extends Optional<VisitorOtpAttributes, 'id' | 'verified' | 'createdAt'> {}

class VisitorOtp extends Model<VisitorOtpAttributes, VisitorOtpCreation> implements VisitorOtpAttributes {
  declare id: string;
  declare email: string;
  declare code: string;
  declare expiresAt: Date;
  declare verified: boolean;
  declare readonly createdAt: Date;
}

VisitorOtp.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { isEmail: true },
    },
    code: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'VisitorOtp',
    tableName: 'visitor_otps',
    updatedAt: false,
    indexes: [
      { fields: ['email', 'code'] },
      { fields: ['expires_at'] },
    ],
  }
);

export default VisitorOtp;
