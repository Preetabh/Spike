import prisma from "../db/db.js";
//  GET USER WORKSPACES
export const getAllGroups = async (req, res) => {
  try {

    const data = [
      {
        id: "1",
        name: "Spike",
        description: "A workspace for Spike project",
        members: [
          {
            id: "1",
            fullName: "John Doe",
            email: "john.doe@example.com"
          }
        ]
      },
       {
        id: "2",
        name: "Spike2",
        description: "A workspace for Spike project",
        members: [
          {
            id: "1",
            fullName: "John Doe2",
            email: "john.doe2@example.com"
          }
        ]
      }

    ]
    return res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
