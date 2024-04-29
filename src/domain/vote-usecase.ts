import { DataSource, DeleteResult, EntityNotFoundError } from "typeorm";
import { VoteRequest } from "../handlers/validator/vote-validator";
import { Vote } from "../database/entities/vote";
import { User } from "../database/entities/useraccount";
import { UserValidator } from "../handlers/validator/useraccount-validator";
import { UseruseCase } from "./user-usecase";
import { AppDataSource } from "../database/database";

export interface ListVoteUseCase {
    limit: number;
    page: number;
}


export class VoteUseCase{

    constructor(private readonly db: DataSource){}

    async listVote(listvote: ListVoteUseCase): Promise<{ vote: Vote[], total: number }> {

        const query = this.db.getRepository(Vote).createQueryBuilder('vote');

        query.skip((listvote.page - 1) * listvote.limit);
        query.take(listvote.limit);

        const [vote, total] = await query.getManyAndCount();
        return {
            vote,
            total
        };
    }

    async createVote(voteData: VoteRequest): Promise<Vote | Error> {

        try{
            const voteRepository  = this.db.getRepository(Vote);
            const newVote = new Vote();
            newVote.Description = voteData.Description,
            newVote.Timeat= voteData.Timeat,
            newVote.Creation_Date = voteData.Creation_Date
            return await voteRepository.save(newVote)
          
        }catch(error){
            console.error("Failed to create vote with ID:", error);
            throw error;
        }
        
    }

    async getVoteById(voteid: number): Promise<Vote> {
        const voteRepository  = this.db.getRepository(Vote);

        const player = await voteRepository.findOne({
            where: { Id: voteid }
        });
        if (!player) {
            throw new EntityNotFoundError(Vote, voteid);
        }
        return player;
    }

    
   
    // Pour la suppression
    async DeleteVote(voteid : number): Promise<DeleteResult>{

        const voteRepository  = this.db.getRepository(Vote);

        try {
            const result = await this.getVoteById(voteid);
            if(result == null){
                throw new Error(`${voteid} not found`);
            }
            if (result instanceof Vote) {
                //const player = result;
                return await voteRepository.delete(voteid);
            } else {
                throw new Error(` not found`);
            }
            
        } catch (error) {
            console.error("Failed to delete vote with ID:", voteid, error);
            throw error;
        }

    }

    async upDateVoteData(voteid : number,info : any){
        try{
            const voteRepository  = this.db.getRepository(Vote);
            const result  = await this.getVoteById(voteid)
            if(result instanceof Vote){
                const vote = result;
              
                Object.assign(vote, info);
            
               await voteRepository.save(vote) 
            }else {
                throw new Error('vote not found');
            }
        }catch(error){
            console.error("Failed to update vote with ID:", voteid, error);
        }
    }
    async AssignVoteUser(voteId:number, userId: number){
        try{
            const voteRepository  = this.db.getRepository(Vote);
            const userUseCase = new UseruseCase(AppDataSource)

            const userPromise = userUseCase.getUserById(userId);
            const votePromise = this.getVoteById(voteId); 

            const user = await userPromise; 
            const vote = await votePromise; 
            console.log("user",user)
            console.log("user",vote)
            if (!user || !vote) {
                throw { error: 'Missing voteId or userId' };
            }

            // Assuming `vote.Users` is an array of `User` objects
            if (!vote.Users) {
                vote.Users = [];
            }
            vote.Users.push(user);
            console.log("vote2",vote)
            await voteRepository.save(vote);
            return vote;

        }catch(error){
            console.error('Error in AssignVoteUser:', error);
        }
    }
}