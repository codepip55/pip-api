import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { User } from "src/users/schemas/users.schema";

export type SignupCodeDocument = SignupCode & Document;

@Schema()
export class SignupCode {

    @Prop({ required: true })
    code: string;

    @Prop({
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
        required: true,
    })
    user: User;
}

export const SignupCodeSchema = 
    SchemaFactory.createForClass(SignupCode)