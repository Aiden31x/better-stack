import {describe,it,expect} from "bun:test";

import axios from "axios";

let BASE_URL="http://localhost:3000";
describe("website get's created ", ()=>{
    it("website not created if url is not present", async ()=>{
        try{
            await axios.post(`${BASE_URL}/website`,{

            });
            expect(false,"Website created when it shouldn't have ")
        }catch(e){}
    })

    it("website is created if url is  present", async ()=>{

            const response=await axios.post(`${BASE_URL}/website`,{
                url: "https://google.com"

            });
            expect(response.data.id).not.toBeNull();

    })



    
})