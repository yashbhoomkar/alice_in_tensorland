import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ReactTyped } from 'react-typed';

import {
  Calendar,
  PieChart,
  BarChart3,
  CreditCard,
  FileText,
  Settings,
  HelpCircle,
  Home,
  ArrowLeft,
  ArrowRight,
  Plus,
  Menu,
  X
} from 'lucide-react';
import AddExpense from './AddExpense';
import { FaUserCircle } from 'react-icons/fa';
import UserProfile from './UserProfile';
import AddIncome from './AddIncome';
import GroupComponent from '../GroupComponents/GroupComponent';
import axios from 'axios';
import ExpenseCard from './ExpenseCard';
import Incomecard from './Incomecard';
import ExpensePieChart from './ExpensePieChart';
import SplitsView from './SplitsView';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user._id || '';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addscreen, setAddscreen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [addIncome, setAddIncome] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [allIncome, setAllIncome] = useState([]);
  const [allExpense, setAllExpense] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [totalown, setTotalown] = useState();
  const [totalExpense, setTotalExpense] = useState();
  const [amountOwed, setAmountOwed] = useState();
  const [showPieChart, setShowPieChart] = useState(false);
  const [userData, setUserData] = useState();
  const [splits, setSplits] = useState([]);
  const [showSplits, setShowSplits] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [bud, setBud] = useState('');

  const SYSTEM_PROMPT = `
You are a Certified Financial Analyst AI. Generate executive reports with these mandatory sections:
DO  NOT MENTION SYSTEM PROMPT DATA in [] directly make heading

【Executive Summary】 
- Lead with 1 primary financial health indicator 
- Highlight 3 key metrics from transaction patterns
- Flag any urgent cash flow risks

【Spending Analysis】
1. Category Breakdown:
   - Top 3 spending categories (amounts & % of total)
   - MoM/YoY comparisons (even if partial data)
   - Group spending dynamics (highlight shared expenses)

2. Anomaly Detection:
   - Recurring irregular payments
   - Category spikes >15% from average
   - Duplicate/overlapping charges

【Budget Optimization】 
For each top category:
- Recommended monthly cap (based on 80th percentile)
- Potential savings (25th/50th/75th percentile scenarios)
- Substitution opportunities (e.g., "Dining → Meal prep: Save ₹X/week")

【Forecast & Planning】
- 30/60/90 day liquidity projection
- Upcoming obligations (rent, subscriptions)
- Savings potential at current rate

【Action Plan】 
Priority matrix:
🟢 Immediate (next 7 days): 
   - Specific payment alerts
   - Quick-win savings
🟡 Short-term (30 days): 
   - Habit adjustments
   - Subscription audits
🔴 Strategic (90 days): 
   - Debt/credit optimization
   - Emergency fund targets

Report Rules:
1. Use INR formatting: ₹1,500 (not 1500)
2. Reference exact transaction details from history
3. Never suggest financial products
4. Maintain 60:40 ratio of findings:solutions
5. For groups: Calculate individual liabilities
6. Highlight split expense imbalances >10%

Example segment:
"April Dining expenses reached ₹27,000 (36% of total). 
Roomie group shows uneven contributions - you cover 68% of meals. 
Recommendation: Rotate payment responsibility weekly to balance."

Formatting:
- Section headers in 【Brackets】
- Key metrics bolded
- Use bullet points & indentation
- Comparisons in parentheses (MoM ▲15%)
`;

  useEffect(() => {
    const generateBudget = async () => {
      try {
        const genAI = new GoogleGenerativeAI(
          'AIzaSyDqlHWwCII7vLdhdLQ9h9w8y5kW_INHiM0'
        );
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const fullSystemPrompt = `${SYSTEM_PROMPT}\n\n# USER TRANSACTIONS\n${JSON.stringify(
          userData
        )}`;
        console.log(fullSystemPrompt, 'Full System prompt');
        const chat = model.startChat({
          systemInstruction: {
            role: 'system',
            parts: [{ text: fullSystemPrompt }]
          },
          generationConfig: {
            temperature: 0.3,
            topP: 0.95,
            topK: 50,
            maxOutputTokens: 800
          }
        });

        const prompt = `Based on the following financial data, create a comprehensive budget plan:
      - ${userData}
      Please structure the budget according to the provided system guidelines.`;

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        setBud(
          response
            .text()
            .replace(/\*\*\*/g, '<hr>')
            .replace(/\*\*/g, '<strong>')
            .replace(/\*\*/g, '</strong>')
            .replace(/\*/g, '<em>')
            .replace(/\*/g, '</em>')
            .replace(/\n\n/g, '<br>')
            .replace(/\n/g, '<br>')
        );
      } catch (error) {
        console.log('Budget generation error:', error);
        // setBud(error);
      }
    };

    generateBudget();
  }, [userData]); // Runs when userData updates

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getUserdata = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/auth/users/${userId}/full-data`
      );
      setUserData(response.data);
      console.log(response.data, 546465456);
    } catch (error) {
      console.log(error, 'cant get data');
    }
  };

  useEffect(() => {
    getUserdata();
  }, []);

  const getOwedData = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/splits/getspiltdata',
        { userId }
      );
      console.log(response, 35415313);
      setAmountOwed(response.data.amountOwed);
    } catch (error) {
      console.log(error);
    }
  };

  const getSplits = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/splits/user/${userId}`
      );
      console.log(response, 'skldjahsfd');
      setSplits(response.data);
      console.log('Splits data:', response.data);
    } catch (error) {
      console.log('Error fetching splits:', error);
    }
  };

  useEffect(() => {
    getOwedData();
    getSplits();
  }, [userId]);

  const navigateTo = view => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  const getAllExpenses = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/transaction/getallexpense',
        { userId }
      );
      setAllExpense(response.data);
    } catch (error) {
      console.log('Error fetching expenses', error);
    }
  };

  const getNavbarData = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/transaction/getdata',
        { userId }
      );
      setTotalExpense(response.data.totalExpense);
      setTotalown(response.data.totalIncome);
    } catch (error) {
      console.log(error, 'navbarddata problem');
    }
  };

  getNavbarData();

  const getAllIncomes = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/transaction/getallincome',
        { userId }
      );
      setAllIncome(response.data);
    } catch (error) {
      console.log('Error fetching Incomes', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getAllExpenses();
      await getAllIncomes();
    };
    fetchData();
  }, []);

  useEffect(() => {
    const combinedTransactions = [...allIncome, ...allExpense];
    setAllTransactions(combinedTransactions);
  }, [allIncome, allExpense]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-blue-50 font-poppins text-blue-900 md:flex-row">
      {/* Mobile Menu Button - Only visible on small screens */}
      {showBudget && (
        <div className="absolute z-40 flex h-screen w-screen items-center justify-center bg-black bg-opacity-25">
          <div className="relative h-[90%] w-[90%] rounded-lg bg-white p-10 text-sm">
            <div
              onClick={() => setShowBudget(false)}
              className="absolute right-5 top-5 z-50 cursor-pointer"
            >
              <X />
            </div>
            <div className="h-full overflow-y-auto pr-2">
              <ReactTyped className="text-sm" strings={[bud]} typeSpeed={5} />
            </div>
          </div>
        </div>
      )}

      <div className="fixed left-4 top-4 z-30 md:hidden">
        <button
          onClick={toggleSidebar}
          className="rounded-full bg-blue-600 p-2 text-white shadow-lg"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar - Changes based on screen size */}
      <div
        className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        fixed z-20 flex h-full
        w-64 flex-col items-center bg-blue-600
        py-4 transition-transform duration-300 ease-in-out md:relative md:w-16 md:translate-x-0
      `}
      >
        <div className="mb-8 flex h-8 w-8 items-center justify-center rounded-full bg-white font-bold text-blue-600">
          S
        </div>
        <div className="mt-4 flex w-full flex-col items-center space-y-6">
          <button
            className={`flex w-full items-center px-6 ${
              currentView === 'dashboard'
                ? 'text-white'
                : 'text-blue-100 hover:text-white'
            } md:justify-center md:px-0`}
            onClick={() => navigateTo('dashboard')}
          >
            <BarChart3 size={20} />
            <span className="ml-4 md:hidden">Dashboard</span>
          </button>
          <button
            className={`flex w-full items-center px-6 ${
              currentView === 'group'
                ? 'text-white'
                : 'text-blue-100 hover:text-white'
            } md:justify-center md:px-0`}
            onClick={() => navigateTo('group')}
          >
            <Home size={20} />
            <span className="ml-4 md:hidden">Group</span>
          </button>
          <button className="flex w-full items-center px-6 text-blue-100 hover:text-white md:justify-center md:px-0">
            <FileText size={20} />
            <span className="ml-4 md:hidden">Documents</span>
          </button>
          <button
            className="flex w-full items-center px-6 text-blue-100 hover:text-white md:justify-center md:px-0"
            onClick={() => setShowSplits(true)}
          >
            <CreditCard size={20} />
            <span className="ml-4 md:hidden">Payments</span>
          </button>
          <button
            className="flex w-full items-center px-6 text-blue-100 hover:text-white md:justify-center md:px-0"
            onClick={() => setShowPieChart(!showPieChart)}
          >
            <PieChart size={20} />
            <span className="ml-4 md:hidden">Analytics</span>
          </button>
        </div>
        <div className="mb-4 mt-auto flex w-full flex-col items-center space-y-6">
          <button
            className="flex w-full items-center px-6 text-blue-100 hover:text-white md:justify-center md:px-0"
            onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/signin';
            }}
          >
            <ArrowLeft size={20} />
            <span className="ml-4 md:hidden">Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className="flex w-full flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 bg-white p-4 shadow-sm md:flex-row md:items-center md:p-6">
          <h1 className="ml-10 text-2xl font-bold text-blue-800 md:ml-0">
            {currentView === 'dashboard' ? 'Overview' : 'Group'}
          </h1>
          <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4 md:w-auto">
            <div
              onClick={() => setShowBudget(true)}
              className="rounded-md bg-blue-600 p-2 font-poppins text-white"
            >
              Generate Budget
            </div>
            <button
              className="flex items-center gap-2 rounded-md bg-green-600 p-2 font-poppins text-white"
              onClick={() => setShowSplits(true)}
            >
              <CreditCard size={16} />
              View Splits
            </button>
            <div className="relative">
              <FaUserCircle
                onClick={() => setShowProfile(!showProfile)}
                size={30}
                className="cursor-pointer"
              />
              {showProfile && (
                <div className="absolute -right-36 top-full z-10 mt-2 -translate-x-1/2 rounded-md bg-white p-4 shadow-lg">
                  <UserProfile
                    addIncome={addIncome}
                    setAddIncome={setAddIncome}
                  />
                  {addIncome && (
                    <AddIncome
                      addIncome={addIncome}
                      setAddIncome={setAddIncome}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard or Group Content based on currentView */}
        {currentView === 'dashboard' ? (
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="mb-6 md:mb-8">
              <h2 className="mb-3 text-xl font-semibold text-blue-800 md:mb-4">
                Summary
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
                {[
                  {
                    title: 'TOTAL INCOME',
                    icon: <PieChart size={16} className="text-green-500" />,
                    value: totalown
                  },
                  {
                    title: 'TOTAL EXPENSE',
                    icon: <BarChart3 size={16} className="text-red-500" />,
                    value: totalExpense
                  },
                  {
                    title: 'TOTAL OWED',
                    icon: <CreditCard size={16} className="text-yellow-500" />,
                    value: amountOwed
                  }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col rounded-md border border-blue-100 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-blue-400 sm:text-sm">
                        {item.title}
                      </span>
                      {item.icon}
                    </div>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-blue-800 sm:text-xl">
                        ₹ {item.value || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="mb-3 text-xl font-semibold text-blue-800 md:mb-4">
                Reports
              </h2>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-md border border-blue-100 bg-white p-4 shadow-sm md:p-6">
                  <h2>Expenses</h2>
                  {allExpense.map((expense, index) => (
                    <ExpenseCard key={index} expense={expense} />
                  ))}
                </div>
                <div className="rounded-md border border-blue-100 bg-white p-4 shadow-sm md:p-6">
                  <h2>Income</h2>
                  {allIncome.map((income, index) => (
                    <Incomecard key={index} income={income} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <GroupComponent />
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-10">
        <button
          onClick={() => setAddscreen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700"
        >
          <Plus size={24} />
        </button>
      </div>

      {addscreen && (
        <AddExpense addscreen={addscreen} setAddscreen={setAddscreen} />
      )}

      {/* Pie Chart Modal */}
      <ExpensePieChart
        isOpen={showPieChart}
        onClose={() => setShowPieChart(false)}
        expenses={allExpense}
      />

      {/* Splits View Modal */}
      <SplitsView
        isOpen={showSplits}
        onClose={() => setShowSplits(false)}
        splits={splits}
      />
    </div>
  );
};

export default Dashboard;
