const LeftPanel = ({ items = [] }) => {
  return (
    <div className="h-full m-5 rounded-md bg-white">

      {/* TABLE HEADER (FIXED) */}
      <div className="sticky top-0 pb-2">
        <div className="flex text-sm font-semibold text-white bg-gradient-to-b   from-secondary to-primary">
          
          {/* Barcode */}
          <div className="w-1/3 px-3 py-2">
            Barcode
          </div>

          {/* Item Name */}
          <div className="w-1/3 px-3 py-2">
            Item
          </div>

          {/* Price Section */}
          <div className="w-1/3 px-3 py-2">
            <div className="grid grid-cols-4 text-center">
              <span>Unit</span>
              <span>Qty</span>
              <span>Disc %</span>
              <span>Subtotal</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE BODY */}
      <div className="p-4 text-sm text-[#777777]">
        {items.length === 0 ? (
          <div className="text-center py-10">
            Scan or Select Product from right to add
          </div>
        ) : (
          items.map((item, index) => (
            <div key={index} className="flex border-b py-2">
              <div className="w-1/3 px-3">{item.barcode}</div>
              <div className="w-1/3 px-3">{item.name}</div>
              <div className="w-1/3">
                <div className="grid grid-cols-4 text-center">
                  <span>{item.price}</span>
                  <span>{item.qty}</span>
                  <span>{item.discount}</span>
                  <span>{item.subtotal}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default LeftPanel;
