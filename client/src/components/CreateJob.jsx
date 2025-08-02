import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ethers } from 'ethers';
import Navbar from './Navbar.jsx';
import JobBoard from '../artifacts/contracts/JobBoard.sol/JobBoard.json';

// IMPORTANT: Replace with your actual deployed contract address on Polygon Amoy
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
const platformFee = "0.001";

const CreateJob = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ title: '', description: '', skills: '', budget: '' });
    const [statusMessage, setStatusMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const { title, description, skills, budget } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setIsProcessing(true);

        if (typeof window.ethereum === 'undefined') {
            setStatusMessage('MetaMask is not installed. Please install it.');
            setIsProcessing(false);
            return;
        }

        try {
            setStatusMessage('Connecting to wallet and preparing transaction...');
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const contract = new ethers.Contract(contractAddress, JobBoard.abi, signer);

            setStatusMessage('Please confirm the transaction in MetaMask...');
            
            const jobDataHash = ethers.sha256(ethers.toUtf8Bytes(JSON.stringify(formData)));
            
            const tx = await contract.postJob(jobDataHash, {
                value: ethers.parseEther(platformFee)
            });

            setStatusMessage('Transaction submitted. Waiting for confirmation...');
            await tx.wait();

            setStatusMessage('Transaction successful! Posting job to our database...');
            const token = localStorage.getItem('token');
            const config = { headers: { 'Content-Type': 'application/json', 'x-auth-token': token } };
            const jobSkillsArray = skills.split(',').map(skill => skill.trim()).filter(Boolean);
            await axios.post('http://localhost:5001/api/jobs', { ...formData, skills: jobSkillsArray }, config);
            
            alert('Job successfully posted on-chain and to our platform!');
            navigate('/jobs');

        } catch (err) {
            console.error(err);
            setStatusMessage(`An error occurred. Please check your wallet and try again.`);
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <Navbar />
            <main className="py-12">
                <div className="px-4 mx-auto max-w-2xl">
                    <div className="p-8 bg-white rounded-xl shadow-lg">
                        <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
                        <p className="mt-1 text-sm text-gray-600">A one-time platform fee of {platformFee} MATIC will be processed on-chain to post this job.</p>
                        
                        <form onSubmit={onSubmit} className="mt-8 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Job Title</label>
                                <input type="text" name="title" value={title} onChange={onChange} required className="block w-full px-4 py-3 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Job Description</label>
                                <textarea name="description" value={description} onChange={onChange} required rows="5" className="block w-full px-4 py-3 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Required Skills (comma separated)</label>
                                <input type="text" name="skills" value={skills} onChange={onChange} required className="block w-full px-4 py-3 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Budget / Salary ($)</label>
                                <input type="number" name="budget" value={budget} onChange={onChange} required className="block w-full px-4 py-3 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm" />
                            </div>
                            
                            {statusMessage && <div className="p-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-lg">{statusMessage}</div>}

                            <div>
                                <button type="submit" disabled={isProcessing} className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
                                    {isProcessing ? 'Processing...' : `Post Job & Pay ${platformFee} MATIC`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};
export default CreateJob;