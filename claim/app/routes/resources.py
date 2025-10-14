"""
Public resource endpoints for claims form dropdowns
No authentication required - public data
"""
from flask import Blueprint, request, jsonify
from app.config.firebase_config import get_firestore

resources_bp = Blueprint('resources', __name__)

@resources_bp.route('/specialties', methods=['GET'])
def get_specialties():
    """Get specialties for a hospital"""
    try:
        hospital_id = request.args.get('hospital_id')
        
        if not hospital_id:
            return jsonify({
                'success': False,
                'error': 'hospital_id parameter is required'
            }), 400
        
        db = get_firestore()
        
        # Get specialty affiliations for the hospital
        specialty_doc = db.collection('specialty_affiliations').document(hospital_id).get()
        
        if not specialty_doc.exists:
            return jsonify({
                'success': True,
                'specialties': [],
                'message': 'No specialties found for this hospital'
            })
        
        data = specialty_doc.to_dict()
        affiliated_specialties = data.get('affiliated_specialties', [])
        
        # Format for dropdown
        specialties = []
        for spec in affiliated_specialties:
            specialties.append({
                'id': spec.get('specialty_id'),
                'name': spec.get('specialty_name'),
                'code': spec.get('specialty_code'),
                'description': spec.get('description', '')
            })
        
        # Sort by name alphabetically
        specialties.sort(key=lambda x: x['name'] if x['name'] else '')
        
        return jsonify({
            'success': True,
            'specialties': specialties,
            'total': len(specialties)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@resources_bp.route('/doctors', methods=['GET'])
def get_doctors():
    """Get doctors, optionally filtered by specialty"""
    try:
        specialty = request.args.get('specialty')
        hospital_id = request.args.get('hospital_id')
        
        db = get_firestore()
        query = db.collection('doctors')
        
        # Filter by hospital if provided
        if hospital_id:
            query = query.where('hospital_id', '==', hospital_id)
        
        # Filter by specialty if provided
        if specialty:
            query = query.where('specialty_name', '==', specialty)
        
        doctors_docs = query.limit(100).get()
        
        doctors = []
        for doc in doctors_docs:
            doctor_data = doc.to_dict()
            doctors.append({
                'id': doc.id,
                'name': doctor_data.get('name') or doctor_data.get('doctor_name') or 'Unknown Doctor',
                'specialty': doctor_data.get('specialty_name'),
                'hospital_id': doctor_data.get('hospital_id')
            })
        
        # Sort by name alphabetically
        doctors.sort(key=lambda x: x['name'] if x['name'] else '')
        
        return jsonify({
            'success': True,
            'doctors': doctors,
            'total': len(doctors)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@resources_bp.route('/payers', methods=['GET'])
def get_payers():
    """Get payers, optionally filtered by type"""
    try:
        payer_type = request.args.get('payer_type')
        hospital_id = request.args.get('hospital_id')
        
        if not hospital_id:
            return jsonify({
                'success': False,
                'error': 'hospital_id parameter is required'
            }), 400
        
        db = get_firestore()
        
        # Search for payer_affiliations by hospital_id field (not document ID)
        payer_affil_query = db.collection('payer_affiliations').where('hospital_id', '==', hospital_id).limit(1).get()
        
        if payer_affil_query and len(payer_affil_query) > 0:
            data = payer_affil_query[0].to_dict()
            affiliated_payers = data.get('affiliated_payers', [])
            
            # Filter by type if provided
            if payer_type:
                affiliated_payers = [p for p in affiliated_payers if p.get('payer_type') == payer_type]
            
            payers = []
            for payer in affiliated_payers:
                payers.append({
                    'id': payer.get('payer_id'),
                    'name': payer.get('payer_name'),
                    'type': payer.get('payer_type'),
                    'insurer_name': payer.get('insurer_name')
                })
            
            # Sort by name alphabetically
            payers.sort(key=lambda x: x['name'] if x['name'] else '')
            
            return jsonify({
                'success': True,
                'payers': payers,
                'total': len(payers),
                'source': 'payer_affiliations'
            })
        
        # Fallback to general payers collection
        query = db.collection('payers')
        if payer_type:
            query = query.where('payer_type', '==', payer_type)
        
        payers_docs = query.limit(100).get()
        
        payers = []
        for doc in payers_docs:
            payer_data = doc.to_dict()
            payers.append({
                'id': doc.id,
                'name': payer_data.get('payer_name'),
                'type': payer_data.get('payer_type')
            })
        
        # Sort by name alphabetically
        payers.sort(key=lambda x: x['name'] if x['name'] else '')
        
        return jsonify({
            'success': True,
            'payers': payers,
            'total': len(payers),
            'source': 'payers_collection'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@resources_bp.route('/insurers', methods=['GET'])
def get_insurers():
    """Get insurers list - ONLY Insurance Company payers (NOT TPA)"""
    try:
        hospital_id = request.args.get('hospital_id')
        
        if not hospital_id:
            return jsonify({
                'success': False,
                'error': 'hospital_id parameter is required'
            }), 400
        
        db = get_firestore()
        
        insurers = []
        
        # Get hospital-specific payers (Insurance Company ONLY, NOT TPA)
        payer_affil_query = db.collection('payer_affiliations').where('hospital_id', '==', hospital_id).limit(1).get()
        
        if payer_affil_query and len(payer_affil_query) > 0:
            data = payer_affil_query[0].to_dict()
            affiliated_payers = data.get('affiliated_payers', [])
            
            for payer in affiliated_payers:
                payer_name = payer.get('payer_name')
                payer_type = payer.get('payer_type', '')
                
                # Only include Insurance Company payers (exclude TPA)
                if payer_name and 'INSURANCE' in payer_type.upper() and 'TPA' not in payer_type.upper():
                    insurers.append({
                        'id': payer.get('payer_id'),
                        'name': payer_name,
                        'type': payer_type
                    })
        
        # Sort by name
        insurers.sort(key=lambda x: x['name'])
        
        return jsonify({
            'success': True,
            'insurers': insurers,
            'total': len(insurers),
            'source': 'payer_affiliations (Insurance Company only)'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@resources_bp.route('/wards', methods=['GET'])
def get_wards():
    """Get ward types"""
    try:
        db = get_firestore()
        wards_docs = db.collection('wards').get()
        
        wards = []
        for doc in wards_docs:
            ward_data = doc.to_dict()
            wards.append({
                'id': doc.id,
                'name': ward_data.get('ward_name'),
                'type': ward_data.get('ward_type')
            })
        
        # Sort by name alphabetically
        wards.sort(key=lambda x: x['name'] if x['name'] else '')
        
        return jsonify({
            'success': True,
            'wards': wards,
            'total': len(wards)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500