import { describe, it, expect, beforeAll } from "bun:test";
import axios from "axios";
import { createUser } from "./testUtils";
import { BACKEND_URL } from "./config";

describe("Website gets created", () => {
    let token: string;

    beforeAll(async () => {
        const data = await createUser();
        token = data.jwt;
    })

    it("Website not created if url is not present", async () => {
        try {
            await axios.post(`${BACKEND_URL}/website`, {
                
            }, {
                headers: {
                    Authorization: token
                }
            });
            expect(false, "Website created when it shouldnt");
        } catch(e) {

        }

    })

    it("Website is created if url is present", async () => {
        const response = await axios.post(`${BACKEND_URL}/website`, {
            url: "https://google.com"
        }, {
            headers: {
                Authorization: token
            }
        })
        expect(response.data.id).not.toBeNull();
    })

    it("Website is created if url is present", async () => {
        const response = await axios.post(`${BACKEND_URL}/website`, {
            url: "https://googlaaasksjjajndejnenine.com"
        }, {
            headers: {
                Authorization: token
            }
        })
        expect(response.data.id).not.toBeNull();
    })


    it("Website is not created if the header is not present", async () => {
        try {
            const response = await axios.post(`${BACKEND_URL}/website`, {
                url: "https://google.com"
            });
            expect(false, "Website shouldnt be created if no auth header")
        } catch(e) {

        }
    })
})
