
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Skill Mapping Config
const PROJECT_SKILL_MAPPING = [
    { keywords: ['Plantation', 'Canopy', 'Green', 'Tree', 'Garden'], skills: ['Gardening', 'Digging', 'Tree Planting'] },
    { keywords: ['Blood', 'Medical', 'Health', 'Doctor', 'Hospital'], skills: ['First Aid', 'Nursing', 'Phlebotomy'] },
    { keywords: ['Solar', 'Electrical', 'Power', 'Energy'], skills: ['Electrical Wiring', 'Solar Panel Installation', 'Safety Protocols'] },
    { keywords: ['Construction', 'Building', 'Site', 'Civil'], skills: ['Masonry', 'Carpentry', 'Heavy Lifting'] },
    { keywords: ['Water', 'Plumbing', 'Pipe'], skills: ['Plumbing', 'Pipe Fitting'] },
    { keywords: ['Test'], skills: ['Testing', 'Quality Assurance'] } // Default for test projects
];

const assignSkills = async () => {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        const connection = await pool.getConnection();

        // 1. Get all workers and their projects
        // We get ALL workers, even those without projects, just in case we want to assign default skills later.
        // But here we focus on project-based skills.
        const [workers] = await connection.query(`
      SELECT DISTINCT u.user_id, u.name, p.name as project_name
      FROM user u
      JOIN task_assignment ta ON u.user_id = ta.worker_id
      JOIN task t ON ta.task_id = t.task_id
      JOIN project p ON t.project_id = p.project_id
      WHERE u.role = 'WORKER'
    `);

        console.log(`Found ${workers.length} worker-project associations.`);

        // Group projects by user
        const userProjects = {};
        workers.forEach(w => {
            if (!userProjects[w.user_id]) {
                userProjects[w.user_id] = { name: w.name, projects: new Set(), newSkills: new Set() };
            }
            userProjects[w.user_id].projects.add(w.project_name);
        });

        // 2. Determine skills for each user
        for (const userId in userProjects) {
            const user = userProjects[userId];
            console.log(`Processing worker: ${user.name} (Projects: ${Array.from(user.projects).join(', ')})`);

            user.projects.forEach(projectName => {
                PROJECT_SKILL_MAPPING.forEach(mapping => {
                    const match = mapping.keywords.some(keyword => projectName.toLowerCase().includes(keyword.toLowerCase()));
                    if (match) {
                        mapping.skills.forEach(skill => user.newSkills.add(skill));
                    }
                });
            });
        }

        // 3. Update database
        for (const userId in userProjects) {
            const user = userProjects[userId];
            const newSkillsArray = Array.from(user.newSkills);

            if (newSkillsArray.length === 0) {
                console.log(`  No new skills inferred for ${user.name}.`);
                continue;
            }

            console.log(`  Assigning skills to ${user.name}: ${newSkillsArray.join(', ')}`);

            // Get existing skills to avoid duplicates (though our set logic handles new ones, we need db IDs)
            // Actually, let's just use the logic of "add if not exists" for each skill

            for (const skillName of newSkillsArray) {
                // Find or create skill
                let [skillRows] = await connection.query('SELECT skill_id FROM skill WHERE name = ?', [skillName]);
                let skill_id;

                if (skillRows.length === 0) {
                    const [result] = await connection.query('INSERT INTO skill (name) VALUES (?)', [skillName]);
                    skill_id = result.insertId;
                    console.log(`    Created new skill: ${skillName}`);
                } else {
                    skill_id = skillRows[0].skill_id;
                }

                // Link to user (ignore if exists)
                try {
                    await connection.query('INSERT INTO user_skill (user_id, skill_id) VALUES (?, ?)', [userId, skill_id]);
                    console.log(`    Linked skill ${skillName} to ${user.name}`);
                } catch (error) {
                    if (error.code === 'ER_DUP_ENTRY') {
                        // Start silently ignoring if already exists
                    } else {
                        console.error(`    Failed to link skill ${skillName}:`, error.message);
                    }
                }
            }
        }

        console.log("\nSkill assignment complete.");

    } catch (error) {
        console.error("Error assigning skills:", error);
    } finally {
        pool.end();
    }
};

assignSkills();
