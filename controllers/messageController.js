const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
  const { chatType, id } = req.params; // chatType: 'private' or 'group', id: userId or groupId
  try {
    const whereClause =
      chatType === 'private'
        ? { [Op.or]: [{ senderId: id }, { receiverId: id }] }
        : { groupId: id };

    const messages = await Message.findAll({ where: whereClause, order: [['createdAt', 'ASC']] });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getChatList = async (req, res) => {

  try {
    res.json("noChat list");

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


