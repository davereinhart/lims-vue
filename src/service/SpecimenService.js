import axios from 'axios'
const baseUrl = `${import.meta.env.VITE_API_URL}/api/specimen`

export const SpecimenService = {
    async getSpecimensData() {
        const specimens = await axios.get(`${baseUrl}`)
        return specimens
    },

    async updateSpecimensData(records) {
        if (records.length == 1) {
            const {id, ...values} = records[0]
            const updatedRecords = await axios.put(`${baseUrl}/${id}`, values)
            return updatedRecords
        }
    }
}
