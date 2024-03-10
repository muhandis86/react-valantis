import { useHttp } from "../hooks/http.hook";
const md5 = require('md5');

const useValantisService = () => {
    const _apiUrl = 'http://api.valantis.store:40000/';
    const _password = 'Valantis';

    const { loading, request, error, clearError } = useHttp();

    const getTimestamp = () => {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = now.getUTCDate().toString().padStart(2, '0');
        return `${year}${month}${day}`;
    }

    const getAuthString = (password, timestamp) => {
        const str = `${password}_${timestamp}`;
        return md5(str);
    }

    const timestamp = getTimestamp();
    const xAuthString = getAuthString(_password, timestamp);

    const getOptions = (body) => ({
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Auth': xAuthString
        },
        body: JSON.stringify(body)
    });

    const getBody = (action, params) => ({ action, params })

    const getIDs = async (offset, limit) => {
        const bodyIDs = getBody("get_ids", { "offset": offset, "limit": limit });
        const res = await request(_apiUrl, getOptions(bodyIDs));
        return res.result;
    }

    const getProducts = async (arrIDs) => {
        const bodyItems = getBody("get_items", { "ids": arrIDs })
        const res = await request(_apiUrl, getOptions(bodyItems));
        return res.result;
    }

    const getFilteredIDs = async (value, filter) => {
        const bodyIDs = getBody("filter", { [filter]: value });
        const res = await request(_apiUrl, getOptions(bodyIDs));
        return res.result;
    }

    return { loading, error, clearError, getProducts, getIDs, getFilteredIDs }
}

export default useValantisService;