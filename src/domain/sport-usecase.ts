import { DataSource } from "typeorm";
import express, { Request, Response} from "express";
import { AppDataSource } from "../database/database";

export class Sport{

    constructor(private readonly db: DataSource){}
}