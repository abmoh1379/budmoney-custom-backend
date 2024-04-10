import axios from 'axios';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

export const privateExpensesAxiosInstance = axios.create({
    baseURL : 'http://mybudmoney.com/api/expenses'
});

export const usersAxiosInstance = axios.create({
    method : 'POST',
    headers : {
        'Content-Type' : 'application/json'
    },
    baseURL : 'http://mybudmoney.com/api/users'
});

export const privateUsersAxiosInstance = axios.create({
    method : 'POST',
    headers : {
        'Content-Type' : 'application/json'
    },
    baseURL : 'http://mybudmoney.com/api/users'
});