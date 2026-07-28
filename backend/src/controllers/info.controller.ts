import { Request, Response } from "express";
import { InfoModel, InfoFormData } from "../models/info.model";

export const InfoController = {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { firstName, lastName, email, salonName }: InfoFormData = req.body;

      if (!firstName || !lastName || !email || !salonName) {
        res.status(400).json({
          success: false,
          message: "All fields are required",
        });
        return;
      }

      const newRecord = await InfoModel.create({
        firstName,
        lastName,
        email,
        salonName,
      });

      res.status(201).json({
        success: true,
        message: "Info saved successfully",
        data: newRecord,
      });
    } catch (error) {
      console.error("InfoController.create error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save info",
      });
    }
  },

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const data = await InfoModel.getAll();
      res.status(200).json(data);
    } catch (error) {
      console.error("InfoController.getAll error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve info",
      });
    }
  },
};
