// require("dotenv").config();
import jwt from "jsonwebtoken";
import express from "express"
const app = express();
import { prismaClient } from "store/client";
import { xAdd } from "redisstream/client";
import { AuthInput } from "./types";
import { authMiddleware } from "./middleware";

app.use(express.json());

app.post("/website", authMiddleware, async (req, res) => {
    if (!req.body.url) {
        return res.status(400).json({ message: "URL is required" });
    }

    try {
        const website = await prismaClient.website.create({
            data: {
                url: req.body.url,
                time_added: new Date(),
                user_id: req.userId!
            }
        });

        // Immediately add the new website to the monitoring queue
        try {
            await xAdd({
                url: website.url,
                id: website.id
            });
            console.log(`🚀 New website ${website.url} immediately added to monitoring queue`);
        } catch (monitoringError) {
            console.error('❌ Error adding website to monitoring queue:', monitoringError);
            // Don't fail the request if monitoring fails
        }

        res.json({
            id: website.id,
            url: website.url,
            message: "Website added successfully"
        });
    } catch (error) {
        console.error('Error creating website:', error);
        res.status(500).json({ message: "Failed to create website" });
    }
});

app.get("/status/:websiteId", authMiddleware, async (req, res) => {
    const website = await prismaClient.website.findFirst({
        where: {
            user_id: req.userId!,
            id: req.params.websiteId,
        },
        include: {
            ticks: {
                orderBy: [{
                    createdAt: 'desc',
                }],
                take: 10
            }
        }
    })

    if (!website) {
        res.status(409).json({
            message: "Not found"
        })
        return;
    }

    res.json({
        url: website.url,
        id: website.id,
        user_id: website.user_id,
        ticks: website.ticks.map(tick => ({
            id: tick.id,
            status: tick.status.toLowerCase(), // Convert "Up" to "up", "Down" to "down"
            response_time: tick.response_time_ms,
            createdAt: tick.createdAt
        }))
    })
})

app.post("/user/signup", async (req, res) => {
    const data = AuthInput.safeParse(req.body);
    if (!data.success) {
        console.log(data.error.toString());
        res.status(403).send("");
        return;
    }

    try {
        let user = await prismaClient.user.create({
            data: {
                username: data.data.username,
                password: data.data.password
            }
        })
        res.json({
            id: user.id
        })
    } catch (e) {
        console.log(e);
        res.status(403).send("");
    }
})

app.post("/user/signin", async (req, res) => {
    const data = AuthInput.safeParse(req.body);
    if (!data.success) {
        res.status(403).send("");
        return;
    }

    let user = await prismaClient.user.findFirst({
        where: {
            username: data.data.username
        }
    })

    if (user?.password !== data.data.password) {
        res.status(403).send("");
        return;
    }

    let token = jwt.sign({
        sub: user.id
    }, process.env.JWT_SECRET!)


    res.json({
        jwt: token
    })
})


app.get("/websites", authMiddleware, async (req, res) => {
    const websites = await prismaClient.website.findMany({
        where: {
            user_id: req.userId
        }
    })

    res.json({
        websites
    })

})

app.listen(process.env.PORT || 3001);