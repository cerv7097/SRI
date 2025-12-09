import React, { useState, useEffect } from 'react';
import SignaturePad from '../shared/SignaturePad';
import FormButtons from '../shared/FormButtons';
import { submitForm, saveDraft, updateForm } from '../../utils/Api';

const createInspectionState = (items) =>
  items.reduce((acc, item) => {
    acc[item.key] = 'none';
    return acc;
  }, {});

const tractorInspectionItems = [
{ key: 'airCompressor', label: 'Air Compressor' },
{ key: 'airLines', label: 'Air Lines' },
{ key: 'backUpAlarm', label: 'Back-up Alarm' },
{ key: 'batteryWaterLevel', label: 'Battery/Battery Water Level' },
{ key: 'body', label: 'Body' },
{ key: 'brakeAccessories', label: 'Brake Accessories' },
{ key: 'brakesParking', label: 'Brakes, Parking' },
{ key: 'brakesService', label: 'Brakes, Service' },
{ key: 'cabLight', label: 'Cab Light' },
{ key: 'clutch', label: 'Clutch' },
{ key: 'couplingDevices', label: 'Coupling Devices' },
{ key: 'defrosterHeater', label: 'Defroster/Heater' },
{ key: 'driveLine', label: 'Drive Line' },
{ key: 'engine', label: 'Engine' },
{ key: 'exhaust', label: 'Exhaust' },
{ key: 'fanBelts', label: 'Fan Belts' },
{ key: 'flagsFlaresFuses', label: 'Flags-Flares-Fuses' },
{ key: 'fireExtinguisher', label: 'Fire Extinguisher' },
{ key: 'frameAssembly', label: 'Frame & Assembly' },
{ key: 'frontAxle', label: 'Front Axle' },
{ key: 'fuelTanks', label: 'Fuel Tanks' },
{ key: 'generator', label: 'Generator' },
{ key: 'heaterAC', label: 'Heater & A/C' },
{ key: 'horn', label: 'Horn' },
{ key: 'lightsHeadStop', label: 'Lights, Head-Stop' },
{ key: 'lightsParking', label: 'Lights, Parking' },
{ key: 'lightsTailDash', label: 'Lights, Tail-Dash' },
{ key: 'lightsTurnIndicators', label: 'Lights, Turn Indicators' },
{ key: 'mirrors', label: 'Mirrors' },
{ key: 'muffler', label: 'Muffler' },
{ key: 'oilPressure', label: 'Oil Pressure' },
{ key: 'radiator', label: 'Radiator' },
{ key: 'rearEnd', label: 'Rear End' },
{ key: 'reflectors', label: 'Reflectors' },
{ key: 'reflectiveTriangles', label: 'Reflective Triangles' },
{ key: 'spareSealBeam', label: 'Spare Seal Beam' },
{ key: 'starter', label: 'Starter' },
{ key: 'steering', label: 'Steering' },
{ key: 'suspensionSystem', label: 'Suspension System' },
{ key: 'tireChains', label: 'Tire Chains' },
{ key: 'tires', label: 'Tires' },
{ key: 'transmission', label: 'Transmission' },
{ key: 'wheelsRims', label: 'Wheels & Rims' },
{ key: 'windows', label: 'Windows' },
{ key: 'windshieldWasher', label: 'Windshield Washer' },
{ key: 'windshieldWipers', label: 'Windshield Wipers' },
{ key: 'other', label: 'Other' }
];

const equipmentInspectionItems = [
{ key: 'airPressure', label: 'Air Pressure' },
{ key: 'backUpAlarm', label: 'Back-up Alarm' },
{ key: 'batteries', label: 'Batteries (Water Level)' },
{ key: 'brakesParking', label: 'Brake, Parking' },
{ key: 'brakesService', label: 'Brake, Service' },
{ key: 'cabLight', label: 'Cab Light' },
{ key: 'controlLevers', label: 'Control/Levers' },
{ key: 'enginePower', label: 'Engine Power' },
{ key: 'fansBlowers', label: 'Fans/Blowers' },
{ key: 'fireExtinguisher', label: 'Fire Extinguisher' },
{ key: 'gauges', label: 'Gauges' },
{ key: 'glassMirror', label: 'Glass/Mirror' },
{ key: 'heaterAC', label: 'Heater & A/C' },
{ key: 'horn', label: 'Horn' },
{ key: 'hydraulicPumpHoses', label: 'Hydraulic Pump/Hoses' },
{ key: 'lightHTCP', label: 'Light H T C P' },
{ key: 'mirrors', label: 'Mirrors' },
{ key: 'obstructsVisibility', label: 'Obstructs in Visibility' },
{ key: 'oilLevel', label: 'Oil/Level' },
{ key: 'oilPressure', label: 'Oil Pressure' },
{ key: 'preCleaners', label: 'Pre-Cleaners' },
{ key: 'seat', label: 'Seat' },
{ key: 'seatBelt', label: 'Seat Belt' },
{ key: 'signals', label: 'Signals' },
{ key: 'steeringMirrors', label: 'Steering' },
{ key: 'stepsRails', label: 'Steps/Rails' },
{ key: 'transmissionOil', label: 'Transmission Oil' },
{ key: 'underCarriage', label: 'Under Carriage' },
{ key: 'waterLevel', label: 'Water Level' },
{ key: 'waterTemperature', label: 'Water Temperature' },
{ key: 'wiperWasher', label: 'Wiper/Washer' },
{ key: 'other', label: 'Other' }
];

const trailerInspectionItems = [
  { key: 'brakeConnections', label: 'Brake Connections' },
  { key: 'brakes', label: 'Brakes' },
  { key: 'couplingDevices', label: 'Coupling Devices' },
  { key: 'doors', label: 'Doors' },
  { key: 'hitch', label: 'Hitch' },
  { key: 'landingGear', label: 'Landing Gear' },
  { key: 'lightsAll', label: 'Lights - All' },
  { key: 'suspensionSystem', label: 'Suspension System' },
  { key: 'tires', label: 'Tires' },
  { key: 'wheelsRims', label: 'Wheels & Rims' },
  { key: 'other', label: 'Other' }
];

const VehicleInspectionForm = ({ onBack, initialData }) => {
  const [formData, setFormData] = useState({
    operatorName: '',
    date: '',
    time: '',
    odometerReading: '',
    vehicleNumber: '',
    tractorItems: createInspectionState(tractorInspectionItems),
    equipmentItems: createInspectionState(equipmentInspectionItems),
    trailerItems: createInspectionState(trailerInspectionItems),
    tractorOtherDetail: '',
    equipmentOtherDetail: '',
    trailerOtherDetail: '',
    trailerUnitDescription: '',
    remarks: '',
    vehicleSatisfactory: false,
    attendees: [{ name: '', role: 'driver', signature: null, showSignaturePad: true }],
    defectsCorrected: false,
    defectsNeedNotBeCorrected: false
  });

  // Load initial data when editing a draft
  useEffect(() => {
    if (initialData) {
      const loadedData = {
        operatorName: initialData.operatorName || '',
        date: initialData.date ? initialData.date.split('T')[0] : '',
        time: initialData.time || '',
        odometerReading: initialData.odometerReading || '',
        vehicleNumber: initialData.vehicleNumber || '',
        tractorItems: initialData.tractorItems || createInspectionState(tractorInspectionItems),
        equipmentItems: initialData.equipmentItems || createInspectionState(equipmentInspectionItems),
        trailerItems: initialData.trailerItems || createInspectionState(trailerInspectionItems),
        tractorOtherDetail: initialData.tractorOtherDetail || '',
        equipmentOtherDetail: initialData.equipmentOtherDetail || '',
        trailerOtherDetail: initialData.trailerOtherDetail || '',
        trailerUnitDescription: initialData.trailerUnitDescription || '',
        remarks: initialData.remarks || '',
        vehicleSatisfactory: initialData.vehicleSatisfactory || false,
        attendees: initialData.attendees && initialData.attendees.length > 0
          ? initialData.attendees.map(att => ({ ...att, showSignaturePad: false }))
          : [{ name: '', role: 'driver', signature: null, showSignaturePad: true }],
        defectsCorrected: initialData.defectsCorrected || false,
        defectsNeedNotBeCorrected: initialData.defectsNeedNotBeCorrected || false
      };
      setFormData(loadedData);
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

    if (name === 'odometerReading') {
      finalValue = value === '' ? '' : parseInt(value, 10) || 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleStatusChange = (category, item, status) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: status
      }
    }));
  };

  const addAttendee = () => {
    setFormData(prev => ({
      ...prev,
      attendees: [...prev.attendees, { name: '', role: 'driver', signature: null, showSignaturePad: true }]
    }));
  };

  const updateAttendeeName = (index, value) => {
    const newAttendees = [...formData.attendees];
    newAttendees[index] = {
      ...newAttendees[index],
      name: value
    };
    setFormData(prev => ({
      ...prev,
      attendees: newAttendees
    }));
  };

  const updateAttendeeRole = (index, role) => {
    const newAttendees = [...formData.attendees];
    newAttendees[index] = {
      ...newAttendees[index],
      role
    };
    setFormData(prev => ({
      ...prev,
      attendees: newAttendees
    }));
  };

  const removeAttendee = (index) => {
    const newAttendees = formData.attendees.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      attendees: newAttendees
    }));
  };

  const updateAttendeeSignature = (index, signature) => {
    const newAttendees = [...formData.attendees];
    newAttendees[index] = {
      ...newAttendees[index],
      signature,
      showSignaturePad: false
    };
    setFormData(prev => ({
      ...prev,
      attendees: newAttendees
    }));
  };

  const toggleSignaturePadVisibility = (index, show) => {
    const newAttendees = [...formData.attendees];
    newAttendees[index] = {
      ...newAttendees[index],
      showSignaturePad: show
    };
    setFormData(prev => ({
      ...prev,
      attendees: newAttendees
    }));
  };

  const getStatusButtonClasses = (category, itemKey, status) => {
    const isActive = formData[category][itemKey] === status;
    const base =
      'flex-1 rounded px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold text-center transition border';
    if (!isActive) {
      return `${base} border-gray-300 text-gray-600 hover:border-gray-400 bg-white`;
    }
    return status === 'ok'
      ? `${base} border-green-600 bg-green-600 text-white shadow-sm`
      : `${base} border-red-600 bg-red-600 text-white shadow-sm`;
  };

  const handleOtherDetailChange = (category, value) => {
    const detailKeyMap = {
      tractorItems: 'tractorOtherDetail',
      equipmentItems: 'equipmentOtherDetail',
      trailerItems: 'trailerOtherDetail'
    };
    const detailKey = detailKeyMap[category];
    if (!detailKey) return;
    setFormData(prev => ({
      ...prev,
      [detailKey]: value
    }));
  };

  const handleSelectAllOk = (category, items) => {
    setFormData(prev => {
      const updatedCategory = { ...prev[category] };
      items.forEach(item => {
        updatedCategory[item.key] = 'ok';
      });
      return {
        ...prev,
        [category]: updatedCategory
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submissionData = {
        ...formData,
        status: 'completed'
      };
      let result;
      if (initialData && initialData._id) {
        result = await updateForm('vehicle-inspection', initialData._id, submissionData);
        console.log('Vehicle Inspection Form updated:', result);
        alert('Vehicle Inspection Form updated successfully!');
      } else {
        result = await submitForm('vehicle-inspection', submissionData);
        console.log('Vehicle Inspection Form submitted:', result);
        alert('Vehicle Inspection Form submitted successfully!');
      }
      onBack();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    }
  };

  const handleSaveDraft = async () => {
    try {
      const draftData = {
        ...formData,
        status: 'draft'
      };
      let result;
      if (initialData && initialData._id) {
        result = await updateForm('vehicle-inspection', initialData._id, draftData);
        console.log('Draft updated:', result);
        alert('Draft updated successfully!');
      } else {
        result = await saveDraft('vehicle-inspection', formData);
        console.log('Draft saved:', result);
        alert('Draft saved successfully!');
      }
      onBack();
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← Back to Dashboard
      </button>
      
      <h1 className="text-2xl font-bold mb-6">Driver Vehicle Inspection Report</h1>
      
      <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-300 rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Operator Name</label>
            <input
              type="text"
              name="operatorName"
              value={formData.operatorName}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded p-2"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Odometer Reading</label>
            <input
              type="number"
              name="odometerReading"
              value={formData.odometerReading}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Vehicle #</label>
            <input
              type="text"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded p-2"
              required
            />
          </div>
        </div>

        <div className="bg-gray-50 border-2 border-gray-300 rounded p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold">Tractor/Truck Inspection</h3>
            <button
              type="button"
              onClick={() => handleSelectAllOk('tractorItems', tractorInspectionItems)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Mark All OK
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tractorInspectionItems.map(item => (
              <div key={item.key} className="rounded border border-white bg-white p-3 shadow-sm">
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className={getStatusButtonClasses('tractorItems', item.key, 'ok')}
                    onClick={() => handleStatusChange('tractorItems', item.key, 'ok')}
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    className={getStatusButtonClasses('tractorItems', item.key, 'us')}
                    onClick={() => handleStatusChange('tractorItems', item.key, 'us')}
                  >
                    U/S
                  </button>
                </div>
                {item.key === 'other' && (
                  <input
                    type="text"
                    value={formData.tractorOtherDetail}
                    onChange={(e) => handleOtherDetailChange('tractorItems', e.target.value)}
                    className="mt-3 w-full rounded border border-gray-300 p-2 text-sm"
                    placeholder="Describe other inspection item"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 border-2 border-gray-300 rounded p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold">Equipment Inspection: Donkey</h3>
            <button
              type="button"
              onClick={() => handleSelectAllOk('equipmentItems', equipmentInspectionItems)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Mark All OK
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {equipmentInspectionItems.map(item => (
              <div key={item.key} className="rounded border border-white bg-white p-3 shadow-sm">
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className={getStatusButtonClasses('equipmentItems', item.key, 'ok')}
                    onClick={() => handleStatusChange('equipmentItems', item.key, 'ok')}
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    className={getStatusButtonClasses('equipmentItems', item.key, 'us')}
                    onClick={() => handleStatusChange('equipmentItems', item.key, 'us')}
                  >
                    U/S
                  </button>
                </div>
                {item.key === 'other' && (
                  <input
                    type="text"
                    value={formData.equipmentOtherDetail}
                    onChange={(e) => handleOtherDetailChange('equipmentItems', e.target.value)}
                    className="mt-3 w-full rounded border border-gray-300 p-2 text-sm"
                    placeholder="Describe other inspection item"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 border-2 border-gray-300 rounded p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold">Trailer Inspection</h3>
            <button
              type="button"
              onClick={() => handleSelectAllOk('trailerItems', trailerInspectionItems)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Mark All OK
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Unit #/Description</label>
            <input
              type="text"
              name="trailerUnitDescription"
              value={formData.trailerUnitDescription}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded p-2"
              placeholder="Enter trailer unit number or description"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {trailerInspectionItems.map(item => (
              <div key={item.key} className="rounded border border-white bg-white p-3 shadow-sm">
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className={getStatusButtonClasses('trailerItems', item.key, 'ok')}
                    onClick={() => handleStatusChange('trailerItems', item.key, 'ok')}
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    className={getStatusButtonClasses('trailerItems', item.key, 'us')}
                    onClick={() => handleStatusChange('trailerItems', item.key, 'us')}
                  >
                    U/S
                  </button>
                </div>
                {item.key === 'other' && (
                  <input
                    type="text"
                    value={formData.trailerOtherDetail}
                    onChange={(e) => handleOtherDetailChange('trailerItems', e.target.value)}
                    className="mt-3 w-full rounded border border-gray-300 p-2 text-sm"
                    placeholder="Describe other inspection item"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleInputChange}
            className="w-full border-2 border-gray-300 rounded p-2 h-24"
            placeholder="Enter any defects or issues found"
          />
        </div>

        <div className="border-t-2 border-gray-200 pt-4">
          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="vehicleSatisfactory"
                checked={formData.vehicleSatisfactory}
                onChange={handleInputChange}
                className="w-5 h-5"
              />
              <span className="font-semibold">Condition of the above vehicle is satisfactory</span>
            </label>
          </div>

          <div className="mb-4 space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="defectsCorrected"
                checked={formData.defectsCorrected}
                onChange={handleInputChange}
                className="w-5 h-5"
              />
              <span className="text-sm">Above defects corrected</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="defectsNeedNotBeCorrected"
                checked={formData.defectsNeedNotBeCorrected}
                onChange={handleInputChange}
                className="w-5 h-5"
              />
              <span className="text-sm">Above defects need not be corrected for safe operation of vehicle</span>
            </label>
          </div>

          <div className="bg-gray-50 border-2 border-gray-300 rounded p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold">Attendees & Signatures</h3>
                <p className="text-sm text-gray-500">Capture signatures for each driver or mechanic involved.</p>
              </div>
              <button
                type="button"
                onClick={addAttendee}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                + Add Attendee
              </button>
            </div>

            <div className="space-y-4">
              {formData.attendees.map((attendee, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded p-4 space-y-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                    <input
                      type="text"
                      value={attendee.name}
                      onChange={(e) => updateAttendeeName(index, e.target.value)}
                      placeholder="Print Name"
                      className="flex-1 border border-gray-300 rounded p-2"
                    />
                    <select
                      value={attendee.role}
                      onChange={(e) => updateAttendeeRole(index, e.target.value)}
                      className="border border-gray-300 rounded p-2 text-sm"
                    >
                      <option value="driver">Driver</option>
                      <option value="mechanic">Mechanic</option>
                    </select>
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Saved Signature</span>
                      <div className="w-40 h-20 border border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50 overflow-hidden">
                        {attendee.signature ? (
                          <img
                            src={attendee.signature}
                            alt={`Signature for ${attendee.name || `Attendee ${index + 1}`}`}
                            className="object-contain w-full h-full"
                          />
                        ) : (
                          <span className="text-xs text-gray-400 text-center px-2">No signature saved</span>
                        )}
                      </div>
                      {!attendee.showSignaturePad && (
                        <button
                          type="button"
                          onClick={() => toggleSignaturePadVisibility(index, true)}
                          className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {attendee.signature ? 'Update Signature' : 'Add Signature'}
                        </button>
                      )}
                    </div>
                    {formData.attendees.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAttendee(index)}
                        className="text-red-600 hover:text-red-800 md:self-start"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {attendee.showSignaturePad && (
                    <SignaturePad
                      onSave={(signature) => updateAttendeeSignature(index, signature)}
                      label={`Signature for ${attendee.role === 'mechanic' ? 'Mechanic' : 'Driver'} ${attendee.name || `Attendee ${index + 1}`}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <FormButtons
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
        />
      </form>
    </div>
  );
};

export default VehicleInspectionForm;
