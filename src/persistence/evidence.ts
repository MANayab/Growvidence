import type { IDBPDatabase } from "idb";
import type { GrowvidenceDB } from "./database";
import { EvidenceSchema, ReviewSchema, type Evidence, type Review } from "./schemas";
export class IndexedDbEvidenceRepository {
 constructor(private readonly database:IDBPDatabase<GrowvidenceDB>){}
 async list(options:{includeDeleted?:boolean}={}):Promise<Evidence[]>{return(await this.database.getAll("evidence")).map(item=>EvidenceSchema.parse(item)).filter(x=>options.includeDeleted||x.deletedAt===null).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));}
 async get(id:string):Promise<Evidence|undefined>{const item=await this.database.get("evidence",id);return item?EvidenceSchema.parse(item):undefined;}
 async save(input:Evidence):Promise<Evidence>{const item=EvidenceSchema.parse(input);await this.database.put("evidence",item);return item;}
 async softDelete(id:string):Promise<void>{const item=await this.get(id);if(!item)return;const now=new Date().toISOString();await this.database.put("evidence",EvidenceSchema.parse({...item,deletedAt:now,updatedAt:now}));}
 async permanentlyDelete(id:string):Promise<void>{const tx=this.database.transaction(["evidence","reviews"],"readwrite");void tx.done.catch(()=>undefined);for(let cursor=await tx.objectStore("reviews").index("by_evidenceId").openCursor(id);cursor;cursor=await cursor.continue())await cursor.delete();await tx.objectStore("evidence").delete(id);await tx.done;}
}
export class IndexedDbReviewsRepository {
 constructor(private readonly database:IDBPDatabase<GrowvidenceDB>){}
 async list(options:{includeDeleted?:boolean}={}):Promise<Review[]>{return(await this.database.getAll("reviews")).map(item=>ReviewSchema.parse(item)).filter(x=>options.includeDeleted||x.deletedAt===null).sort((a,b)=>b.reviewedAt.localeCompare(a.reviewedAt));}
 async get(id:string):Promise<Review|undefined>{const item=await this.database.get("reviews",id);return item?ReviewSchema.parse(item):undefined;}
 async save(input:Review):Promise<Review>{const item=ReviewSchema.parse(input);await this.database.put("reviews",item);return item;}
 async softDelete(id:string):Promise<void>{const item=await this.get(id);if(!item)return;const now=new Date().toISOString();await this.database.put("reviews",ReviewSchema.parse({...item,deletedAt:now,updatedAt:now}));}
 async permanentlyDelete(id:string):Promise<void>{await this.database.delete("reviews",id);}
}
