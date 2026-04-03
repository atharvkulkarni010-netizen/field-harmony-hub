import pool from '../config/database.js';

export const getAllSkills = async () => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query('SELECT * FROM skill ORDER BY name ASC');
        return rows;
    } finally {
        connection.release();
    }
};

export const findSkillByName = async (name) => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query('SELECT * FROM skill WHERE name = ?', [name]);
        return rows[0];
    } finally {
        connection.release();
    }
};

export const createSkill = async (name) => {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query('INSERT INTO skill (name) VALUES (?)', [name]);
        return { skill_id: result.insertId, name };
    } finally {
        connection.release();
    }
};

export const addUserSkill = async (user_id, skill_id) => {
    const connection = await pool.getConnection();
    try {
        await connection.query(
            'INSERT IGNORE INTO user_skill (user_id, skill_id) VALUES (?, ?)',
            [user_id, skill_id]
        );
    } finally {
        connection.release();
    }
};

export const processUserSkills = async (user_id, skills) => {
    if (!skills || !Array.isArray(skills)) return;

    for (const skillName of skills) {
        let skill = await findSkillByName(skillName);
        if (!skill) {
            skill = await createSkill(skillName);
        }
        await addUserSkill(user_id, skill.skill_id);
    }
};


export const getUserSkills = async (user_id) => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query(`
            SELECT s.skill_id, s.name 
            FROM skill s
            JOIN user_skill us ON s.skill_id = us.skill_id
            WHERE us.user_id = ?
        `, [user_id]);
        return rows;
    } finally {
        connection.release();
    }
};

export const updateUserSkills = async (user_id, skills) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Remove all existing skills for the user
        await connection.query('DELETE FROM user_skill WHERE user_id = ?', [user_id]);

        // 2. Add new skills
        if (skills && skills.length > 0) {
            for (const skillName of skills) {
                let [skillRows] = await connection.query('SELECT * FROM skill WHERE name = ?', [skillName]);
                let skill_id;

                if (skillRows.length === 0) {
                    const [result] = await connection.query('INSERT INTO skill (name) VALUES (?)', [skillName]);
                    skill_id = result.insertId;
                } else {
                    skill_id = skillRows[0].skill_id;
                }

                await connection.query('INSERT INTO user_skill (user_id, skill_id) VALUES (?, ?)', [user_id, skill_id]);
            }
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
