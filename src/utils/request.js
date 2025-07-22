import axios from "axios";
import { useAtom } from "jotai";

const baseUrl = 'https://localhost:8080/'

const [token ,setToken] = useAtom(tokenAtom)

const Post = async (url,Data) => {
    try{
        const response = await axios.post(baseUrl+url, Data,{
           headers:{Authorization : `Bearer ${token}`}
        });
        return response.data
    }catch (error) {
    console.error('Error creating post:', error);
    }   
}

const Get = async (url) => {
    try{
        const response = await axios.get(baseUrl+url);
        return response.data
    }catch (error) {
    console.error('Error creating post:', error);
    }   
}

const Put = async (url,Data) => {
    try{
        const response = await axios.put(baseUrl+url, Data,{
            headers:{Authorization : `Bearer ${token}`}
        });
        return response.data
    }catch (error) {
    console.error('Error creating post:', error);
    }   
}

const Delete = async (url,Data) => {
    try{
        const response = await axios.delete(baseUrl+url, Data,{
            headers:{Authorization : `Bearer ${token}`}
        });
        return response.data
    }catch (error) {
    console.error('Error creating post:', error);
    }   
}

export { Post ,Put ,Delete ,Get ,token ,setToken }