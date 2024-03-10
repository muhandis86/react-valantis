import { useState, useEffect } from "react";
import useValantisService from "../../service/ValantisService";
import Spinner from "../spinner/Spinner";

import './ProductList.scss';

const ProductList = () => {

    const [products, setProducts] = useState([]);
    const [start, setStart] = useState(false);
    const [offset, setOffset] = useState(0);

    const [counter, setCounter] = useState(1);
    const [lastCounter, setLastCounter] = useState(1);

    const [inputValue, setInputValue] = useState('');
    const [inputText, setInputText] = useState('Enter product name...');
    const [inputType, setInputType] = useState('text');

    const [filter, setFilter] = useState('product');
    const [search, setSearch] = useState(false);

    const { loading, error, clearError, getProducts, getIDs, getFilteredIDs } = useValantisService();

    // =======================get products from api=====================
    useEffect(() => {
        if (inputValue !== '') {
            const newInputValue = filter === 'price' ? +inputValue : inputValue;
            getFilteredIDs(newInputValue, filter)
                .then(arr => {
                    arr.length !== 0 ? setLastCounter(Math.ceil(arr.length / 50)) : setLastCounter(1);
                    const arrList = arr.slice(offset, offset + 50);
                    getProducts(arrList)
                        .then(arr => {
                            setProducts(getUniqArr(arr));
                        })
                })
            setSearch(false);
        } else {
            if (start) {
                getIDs(offset, 50)
                    .then(arr => {
                        if (arr.length !== 0) {
                            getProducts(arr)
                                .then(arr => {
                                    setProducts(getUniqArr(arr));
                                })
                        }
                    })
            } else {
                getIDs(offset, null)
                    .then(arr => {
                        if (arr.length !== 0) {
                            setLastCounter(Math.ceil(arr.length / 50));
                            setStart(true);
                        }
                    });
            }
        }
    }, [start, search, offset, error])

    //===================get unique array============================
    const getUniqArr = (arr) => {
        let uniqArrIds = [];
        return arr.filter(item => {
            if (!uniqArrIds.includes(item.id)) {
                uniqArrIds.push(item.id);
                return item;
            }
        })
    }

    const onBtnClick = (name) => {
        setFilter(name);
        if (name === 'product') {
            setInputText('Enter product name...');
            setInputType('text');
        }
        if (name === 'price') {
            setInputText('Enter price...');
            setInputType('number');
        }
        if (name === 'brand') {
            setInputText('Enter brand name...');
            setInputType('text');
        }
    }

    const onGo = (event) => {
        if (inputValue !== '') {
            event.preventDefault();
            setSearch(true);
            setCounter(1);
            setLastCounter(1);
            setOffset(0);
        }
    }

    const onReset = (event) => {
        event.preventDefault();
        setInputValue('');
        setSearch(false);
        setStart(false);
        setCounter(1);
        setLastCounter(1);
        setOffset(0);
        setFilter('product');
        setInputText('Enter product name...');
        setInputType('text');
    }

    const onChangeList = (shift) => {
        clearError();
        setOffset(offset => offset + shift);
        if (shift < 0) {
            setCounter(counter => counter - 1);
        } else {
            setCounter(counter => counter + 1);
        }
    }

    const onHome = () => {
        setCounter(1);
        setOffset(0);
    }

    const onEnd = () => {
        setCounter(lastCounter);
        setOffset((lastCounter - 1) * 50);
    }

    const onChangeValue = (e) => {
        setInputValue(e.target.value);
    }

    const buttonsData = [
        { name: 'product', label: 'Name' },
        { name: 'price', label: 'Price' },
        { name: 'brand', label: 'Brand' }
    ];

    const buttons = buttonsData.map(({ name, label }) => {
        const active = filter === name;
        const clazz = active ? 'btn-secondary' : 'btn-outline-secondary';
        return (
            <button
                key={name}
                className={`btn btn-sm ${clazz}`}
                type="button"
                onClick={() => onBtnClick(name)}>
                {label}
            </button>
        )
    })

    const disableBtnPrev = counter === 1;
    const disableBtnNext = counter === +lastCounter;

    const spinner = loading ? <Spinner /> : null;
    const content = !(loading) ? (products.length !== 0 ? products.map((item, i) => (
        <div key={i} className="list">
            <span>{i + 1}. </span>
            <span>{item.id}</span>
            <span>{item.price}</span>
            <span>{item.product}</span>
            <span>{item.brand}</span>
        </div>
    )) : 'Products is not found...') : null;

    return (
        <>
            <div className="author">Created by <a href="#">&copy;ZAUR ESKENDAROV</a></div>
            {/* =========================================================================== */}
            <div className="configuration">
                <div className="filter">
                    <span>Filter: </span>
                    <div className="btn-group">
                        {buttons}
                    </div>
                </div>
                <form className="search">
                    <span>Search: </span>
                    <input
                        required
                        type={inputType}
                        value={inputValue}
                        placeholder={inputText}
                        onChange={onChangeValue}
                    />
                    <button
                        className="btn btn-sm btn-secondary"
                        onClick={onGo}>Go</button>
                    <button
                        className="btn btn-sm btn-secondary"
                        onClick={onReset}>Reset</button>
                </form>
            </div>
            {/* =========================================================================== */}
            <div className="productsList">
                {spinner}
                {content}
            </div>
            {/* =========================================================================== */}
            <div className="navigation">
                <button
                    className="btn btn-sm btn-secondary"
                    disabled={disableBtnPrev}
                    onClick={onHome}>home</button>
                <button
                    className="btn btn-sm btn-secondary"
                    disabled={disableBtnPrev}
                    onClick={() => onChangeList(-50)}> prev </button>
                <span> {counter} / {lastCounter} </span>
                <button
                    className="btn btn-sm btn-secondary"
                    disabled={disableBtnNext}
                    onClick={() => onChangeList(50)}> next </button>
                <button
                    className="btn btn-sm btn-secondary"
                    disabled={disableBtnNext}
                    onClick={onEnd}>end</button>
            </div>
        </>
    )
}

export default ProductList;