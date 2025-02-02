'use strict';
module.exports = (sequelize, DataTypes) => {
  const EventsTopics = sequelize.define('EventsTopics', {
    EventId: {
      type: DataTypes.UUID,
      references: {
        model: "Events",
        key: "id"
      }
    },
    TopicName: {
      type: DataTypes.STRING,
      references: {
        model: "Topics",
        key: "name"
      }
    }
  }, {
    timestamps: false
  });
  EventsTopics.associate = function (models) {};
  return EventsTopics;
};