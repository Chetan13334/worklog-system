module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attendance', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      attendance_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      check_in_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      check_out_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      total_hours: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('checked_in', 'checked_out'),
        allowNull: false,
        defaultValue: 'checked_in'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('attendance', ['user_id', 'attendance_date'], {
      unique: true,
      name: 'attendance_user_date_unique'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('attendance');
  }
};
