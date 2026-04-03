import * as skillService from '../services/skillService.js';

export const getAllSkills = async (req, res) => {
    try {
        const skills = await skillService.getAllSkills();
        res.json(skills);
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ message: 'Error fetching skills' });
    }
};

export const createSkill = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Skill name is required' });
        }

        const existingSkill = await skillService.findSkillByName(name);
        if (existingSkill) {
            return res.status(400).json({ message: 'Skill already exists' });
        }

        const newSkill = await skillService.createSkill(name);
        res.status(201).json(newSkill);
    } catch (error) {
        console.error('Error creating skill:', error);
        res.status(500).json({ message: 'Error creating skill' });
    }
};
