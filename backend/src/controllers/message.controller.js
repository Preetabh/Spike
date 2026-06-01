import Message from "../models/message-model.js";
import Channel from "../models/channel-model.js";

/* =====================================
   SEND MESSAGE
===================================== */
export const sendMessage = async (req, res, next) => {
  try {
    const { channelId, content } = req.body;

    if (!channelId || !content) {
      return res.status(400).json({ message: "Channel & content required" });
    }

    const message = await Message.create({
      channel: channelId,
      sender: req.user._id,
      content,
    });

    // 🔥 Update lastMessage in channel
    await Channel.findByIdAndUpdate(channelId, {
      lastMessage: message._id,
    });

    const populatedMessage = await message.populate(
      "sender",
      "fullName email profilePic"
    );

    // 🔥 Emit via socket
    const io = req.app.get("io");
    if (io) {
      io.to(`channel_${channelId}`).emit("receiveMessage", populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    next(error);
  }
};

/* =====================================
   GET CHANNEL MESSAGES
===================================== */
export const getChannelMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    const messages = await Message.find({
      channel: channelId,
      isDeleted: false,
    })
      .populate("sender", "fullName email profilePic")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

/* =====================================
   EDIT MESSAGE
===================================== */
export const editMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    message.content = content || message.content;
    message.isEdited = true;
    await message.save();

    res.json(message);
  } catch (error) {
    next(error);
  }
};

/* =====================================
   DELETE MESSAGE (SOFT)
===================================== */
export const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    message.isDeleted = true;
    await message.save();

    res.json({ message: "Message deleted" });
  } catch (error) {
    next(error);
  }
};

/* =====================================
   ADD REACTION
===================================== */
export const addReaction = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const alreadyReacted = message.reactions.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (!alreadyReacted) {
      message.reactions.push({
        user: req.user._id,
        emoji,
      });
    }

    await message.save();

    res.json(message);
  } catch (error) {
    next(error);
  }
};

/* =====================================
   REMOVE REACTION
===================================== */
export const removeReaction = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    message.reactions = message.reactions.filter(
      (r) => r.user.toString() !== req.user._id.toString()
    );

    await message.save();

    res.json(message);
  } catch (error) {
    next(error);
  }
};
