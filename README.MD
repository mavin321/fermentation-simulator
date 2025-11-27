cd c_core
make
# Produces libfermentation.so

#backend
cd backend
uvicorn fermentation_sim.api.main:app --reload

#frontend
cd frontend
npm install
npm run dev
