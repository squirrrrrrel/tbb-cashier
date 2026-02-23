import React, { useState } from 'react'
import api from '../../../utils/api'
import { useNotification } from '../../../hooks/useNotification'

const PettyCash = ({ setIsPettyClicked }) => {

    const [pettyPayload, setPettyPayload] = useState({
        transaction_type: "OUT",
        amount: "",
        reference: ""
    })
    const { notifySuccess, notifyError } = useNotification();

    const sendPettyPayload = async () => {
        if(!pettyPayload.amount || !pettyPayload.reference){
            notifyError("Enter Amount and Reason");
            return;
        }
        try {
            await api.post('/outlet/petty-expense', pettyPayload);
            setPettyPayload({});
            notifySuccess("Petty Cash Added");
            setIsPettyClicked(false);
        } catch (err) {
            console.log(err);
            notifyError("Error on adding petty cash");
        }
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setIsPettyClicked(false)}>
            <div className="bg-white rounded-md shadow-2xl w-[400px] py-5 px-6 animate-scale-in text-[#555555]" onClick={e => e.stopPropagation()}>
                <h1 className='text-2xl text-center font-bold'>Petty Expenses</h1>
                <div className="in-out-select-button w-full bg-gray-100 p-4 rounded-md mt-4 flex flex-col items-center gap-4">
                    <h2 className='text-lg font-semibold'>Select Transction Type</h2>
                    <div className="button flex gap-2 justify-center">
                        <button disabled className="button py-3 text-xs bg-white w-20 text-center rounded-md cursor-not-allowed shadow-[0_0_3px_#00000026]">IN</button>
                        <button className={`button py-3 text-xs w-20 text-center rounded-md ${pettyPayload.transaction_type === "OUT" ? "bg-linear-to-b from-primary to-secondary text-white" : "bg-white shadow-[0_0_3px_#00000026]"}`}>OUT</button>
                    </div>

                </div>
                <input
                    value={pettyPayload.amount}
                    onChange={e => setPettyPayload(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder='Enter Amount'
                    className='w-full p-2.5 outline-none shadow-[0_0_3px_#00000026] bg-white rounded-md mt-5 text-sm placeholder:text-[#555555]'
                />
                <input
                    value={pettyPayload.reference}
                    onChange={e => setPettyPayload(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder='Enter Reason'
                    className='w-full p-2.5 outline-none shadow-[0_0_3px_#00000026] bg-white rounded-md mt-5 text-sm placeholder:text-[#555555]'
                />
                <div className="submit-button mt-5 text-[#555555] font-bold flex gap-4">
                    <button onClick={() => sendPettyPayload()} className="button p-2.5 text-sm bg-linear-to-b from-primary to-secondary text-white text-center rounded-md w-full cursor-pointer flex gap-2 justify-center items-center"><svg viewBox="64 64 896 896" focusable="false" data-icon="plus" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path><path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path></svg>Add</button>
                    <button onClick={() => setIsPettyClicked(false)} className="button p-2.5 text-sm bg-white text-center rounded-md w-full outline-none cursor-pointer flex gap-2 justify-center items-center shadow-[0_0_3px_#00000026]"><svg viewBox="64 64 896 896" focusable="false" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg>Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default PettyCash