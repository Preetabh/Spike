import Channel from "../../models/channel-model.js";
import Workspace from "../../models/workspace-model.js";

/* ======================================================
   CREATE CHANNEL
====================================================== */
export const createChannel = async (req, res, next) => {
  try {
    const { name, workspaceId, type = "public", members = [] } = req.body;

    if (!name || !workspaceId) {
      return res.status(400).json({ message: "Name and workspaceId required" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isMember = workspace.members.some(
      (m) => m.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    let channelMembers = [req.user._id];

    if (type === "private" && members.length > 0) {
      channelMembers = [...new Set([...members, req.user._id.toString()])];
    }

    const channel = await Channel.create({
      name,
      workspace: workspaceId,
      type,
      members: channelMembers,
      createdBy: req.user._id,
    });

    const populated = await channel.populate(
      "members",
      "fullName email profilePic"
    );

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   GET WORKSPACE CHANNELS
====================================================== */
export const getWorkspaceChannels = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const data = [
      {
        _id: "123",
        name: "general",
        workspace: workspaceId,
        type: "public",
        members: [
          {
            _id: "u1",
            fullName: "John Doe",
            email: "john.doe@example.com",
            profilePic: "https://example.com/avatar.jpg"
          }
        ]
      },
        {
        _id: "1234",
        name: "general2",
        workspace: workspaceId,
        type: "public",
        members: [
          {
            _id: "u123",
            fullName: "John Doe12",
            email: "john.doe12@example.com",
            profilePic: "https://example.com/avatar.jpg"
          }
        ]
      },
      {
        _id: "12345",
        name: "general23",
        workspace: workspaceId,
        type: "public",
        members: [
          {
            _id: "u1233",
            fullName: "John Doe123",
            email: "john.doe123@example.com",
            profilePic: "https://example.com/avatar.jpg"
          }
        ]
      },
      {
        _id: "123456",
        name: "general234",
        workspace: workspaceId,
        type: "public",
        members: [
          {
            _id: "u12334",
            fullName: "John Doe123",
            email: "john.doe123@example.com",
            profilePic: "https://example.com/avatar.jpg"
          }
        ]
      },
      {
        _id: "123454",
        name: "general234",
        workspace: workspaceId,
        type: "public",
        members: [
          {
            _id: "u1233",
            fullName: "John Doe123",
            email: "john.doe123@example.com",
            profilePic: "https://example.com/avatar.jpg"
          }
        ]
      },
      {
        _id: "1234534",
        name: "general2334",
        workspace: workspaceId,
        type: "public",
        members: [
          {
            _id: "u1233",
            fullName: "John Doe123",
            email: "john.doe123@example.com",
            profilePic: "https://example.com/avatar.jpg"
          }
        ]
      },
      {
        _id: "1234545",
        name: "general2345",
        workspace: workspaceId,
        type: "public",
        members: [
          {
            _id: "u1233",
            fullName: "John Doe123",
            email: "john.doe123@example.com",
            profilePic: "https://example.com/avatar.jpg"
          }
        ]
      },
      {
        _id: "1234556",
        name: "general2356",
        workspace: workspaceId,
        type: "public",
        members: [
          {
            _id: "u1233",
            fullName: "John Doe123",
            email: "john.doe123@example.com",
            profilePic: "https://example.com/avatar.jpg"
          }
        ]
      },
      {
        _id: "1234567",
        name: "general2367",
        workspace: workspaceId,
        type: "public",
        members: [
          {
            _id: "u1233",
            fullName: "John Doe123",
            email: "john.doe123@example.com",
            profilePic: "https://example.com/avatar.jpg"
          }
        ]
      },
      {
        _id: "1234589",
        name: "general2334",
        workspace: workspaceId,
        type: "public",
        members: [
          {
            _id: "u1233",
            fullName: "John Doe123",
            email: "john.doe123@example.com",
            profilePic: "https://example.com/avatar.jpg"
          }
        ]
      },
      {
        _id: "1234512",
        name: "general2312",
        workspace: workspaceId,
        type: "public",
        members: [
          {
            _id: "u123312",
            fullName: "John Doe12312",
            email: "john.doe123@example.com",
            profilePic: "https://example.com/avatar.jpg"
          }
        ]
      },
      {
        _id: "12345345",
        name: "general23324",
        workspace: workspaceId,
        type: "public",
        members: [
          {
            _id: "u12335",
            fullName: "John Doe1237",
            email: "john.doe123@example.com",
            profilePic: "https://example.com/avatar.jpg"
          }
        ]
      },
      {
        _id: "1234567",
        name: "general231",
        workspace: workspaceId,
        type: "public",
        members: [
          {
            _id: "u123390",
            fullName: "John Doe1234",
            email: "john.doe123@example.com",
            profilePic: "https://example.com/avatar.jpg"
          }
        ]
      }

    ]
    res.status(200).json(data);

    // const workspace = await Workspace.findById(workspaceId);
    // if (!workspace) {
    //   return res.status(404).json({ message: "Workspace not found" });
    // }

    // const isMember = workspace.members.some(
    //   (m) => m.toString() === req.user._id.toString()
    // );

    // if (!isMember) {
    //   return res.status(403).json({ message: "Access denied" });
    // }

    // const channels = await Channel.find({
    //   workspace: workspaceId,
    //   isDeleted: false,
    // })
    //   .populate("createdBy", "fullName email")
    //   .populate("lastMessage")
    //   .sort({ createdAt: 1 });

    // res.status(200).json(channels);
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   GET SINGLE CHANNEL
====================================================== */
export const getChannelById = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId)
      .populate("members", "fullName email profilePic")
      .populate("createdBy", "fullName email")
      .populate("lastMessage");

    if (!channel || channel.isDeleted) {
      return res.status(404).json({ message: "Channel not found" });
    }

    res.status(200).json(channel);
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   UPDATE CHANNEL
====================================================== */
export const updateChannel = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { name, description } = req.body;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    channel.name = name || channel.name;
    channel.description = description || channel.description;

    await channel.save();

    res.status(200).json(channel);
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   SOFT DELETE CHANNEL
====================================================== */
export const deleteChannel = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    channel.isDeleted = true;
    await channel.save();

    res.status(200).json({ message: "Channel deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   ARCHIVE CHANNEL
====================================================== */
export const archiveChannel = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    channel.isArchived = true;
    await channel.save();

    res.status(200).json({ message: "Channel archived" });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   ADD MEMBER
====================================================== */
export const addChannelMember = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { userId } = req.body;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (!channel.members.includes(userId)) {
      channel.members.push(userId);
      await channel.save();
    }

    res.status(200).json(channel);
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   REMOVE MEMBER
====================================================== */
export const removeChannelMember = async (req, res, next) => {
  try {
    const { channelId, userId } = req.params;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    channel.members = channel.members.filter(
      (m) => m.toString() !== userId
    );

    await channel.save();

    res.status(200).json({ message: "Member removed" });
  } catch (error) {
    next(error);
  }
};
