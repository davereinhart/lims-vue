import axios from 'axios'
const baseUrl = `${import.meta.env.VITE_API_URL}/api/specimen`

export const SpecimenService = {
    async getSpecimensData() {
        const specimens = await axios.get(`${baseUrl}/all`)
        return specimens
    }
}
