import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    background: linear-gradient(45deg, #144FC4, #48BB27);
    margin: 0;
    padding: 0;
    position: relative;
`;

const DataSection = styled.div`
    background: #ffffff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 80%;
    max-width: 800px;
    margin: 40px 0;
    text-align: center;
    flex-grow: 1;
    overflow-y: auto;
`;

const Button = styled.button`
    position: absolute;
    bottom: 20px;
    right: 20px;
    padding: 10px 20px;
    background-color: #0056b3;
    color: #ffffff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

    &:hover {
        background-color: #ff7f00;
    }
`;

const Pagination = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    margin-bottom: 60px; /* Alt boşluk ekleyerek konumu yukarı taşı */
    
    & > button {
        margin: 0 5px;
        padding: 5px 10px;
        background-color: #144FC4;
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;

        &:hover {
            background-color: #48BB27;
        }

        &:disabled {
            background-color: #c41111;
            cursor: not-allowed;
        }
    }
`;


const LeaveFormList = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(10);
    const [data, setData] = useState([]);

    useEffect(() => {

        const fetchData = async () => {

            setData(Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1 + (currentPage - 1) * 10}` })));
        };

        fetchData();
    }, [currentPage]);

    const handleButtonClick = () => {
        navigate('/leave-form');
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderPaginationButtons = () => {
        const buttons = [];
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            buttons.push(
                <button key="first" onClick={() => handlePageClick(1)}>
                    1
                </button>
            );
            if (startPage > 2) {
                buttons.push(<span key="start-ellipsis">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => handlePageClick(i)}
                    disabled={i === currentPage}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                buttons.push(<span key="end-ellipsis">...</span>);
            }
            buttons.push(
                <button key="last" onClick={() => handlePageClick(totalPages)}>
                    {totalPages}
                </button>
            );
        }

        return buttons;
    };

    return (
        <Container>
            <DataSection>
                {data.map(item => (
                    <div key={item.id}>{item.name}</div>
                ))}
            </DataSection>
            <Pagination>
                <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                    &laquo;
                </button>
                {renderPaginationButtons()}
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    &raquo;
                </button>
            </Pagination>
            <Button onClick={handleButtonClick}>New Leave Form</Button>
        </Container>
    );
};

export default LeaveFormList;
